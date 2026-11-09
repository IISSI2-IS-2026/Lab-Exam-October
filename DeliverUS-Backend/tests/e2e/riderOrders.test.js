import request from 'supertest'
import { shutdownApp, getApp } from './utils/testApp'
import { getLoggedInCustomer, getLoggedInOwner, getLoggedInRider, getNewLoggedInRider } from './utils/auth'
import { getFirstRestaurantOfOwner } from './utils/restaurant'
import { generateFakeUser } from './utils/testData'
import { Order } from '../../src/models/models.js'

// NOTE: POST /orders (order creation) is not implemented yet in this branch, so order
// fixtures are created directly through the Order model instead of the customer-facing
// endpoint. The rider workflow endpoints under test (confirm/accept/riderDeliver/
// riderComments) are exercised through the real HTTP API.
const createTestOrder = async (customer, restaurant, overrides = {}) => {
  const order = await Order.create({
    address: 'Fake street 123',
    price: 15,
    shippingCosts: restaurant.shippingCosts,
    restaurantId: restaurant.id,
    userId: customer.id,
    ownerApprove: true,
    deliveryCode: '1234',
    ...overrides
  })
  return order.toJSON()
}

const confirmOrder = async (app, owner, order) => {
  await request(app).patch(`/orders/${order.id}/confirm`).set('Authorization', `Bearer ${owner.token}`).send()
}

const createConfirmedOrder = async (app, owner, customer, restaurant) => {
  const order = await createTestOrder(customer, restaurant)
  await confirmOrder(app, owner, order)
  return order
}

const acceptOrder = async (app, rider, order) => {
  await request(app).patch(`/orders/${order.id}/accept`).set('Authorization', `Bearer ${rider.token}`).send()
}

const createDisqualifiedRider = async (app, owner) => {
  const disqualifiedRider = await getNewLoggedInRider()
  await request(await request(app).patch(`/orders/rider/${disqualifiedRider.id}/disqualify`).set('Authorization', `Bearer ${owner.token}`).send())
  return disqualifiedRider
}

describe('Register and login rider', () => {
  let fakeRider, app
  beforeAll(async () => {
    fakeRider = await generateFakeUser()
    app = await getApp()
  })
  it('Should return 422 when no email is provided', async () => {
    const invalidRider = { ...fakeRider }
    delete invalidRider.email
    const response = await request(app).post('/users/registerRider').send(invalidRider)
    expect(response.status).toBe(422)
  })
  it('Should return 200 when registering a new rider', async () => {
    const response = await request(app).post('/users/registerRider').send(fakeRider)
    expect(response.status).toBe(200)
    expect(response.body.id).toBeDefined()
  })
  it('Should be able to login as rider after registration', async () => {
    const response = await request(app).post('/users/loginRider').send({ email: fakeRider.email, password: fakeRider.password })
    expect(response.status).toBe(200)
    expect(response.body.token).toBeDefined()
  })
  it('Should return 401 when trying to login as a customer with rider credentials', async () => {
    const response = await request(app).post('/users/login').send({ email: fakeRider.email, password: fakeRider.password })
    expect(response.status).toBe(401)
  })
  afterAll(async () => {
    await shutdownApp()
  })
})

describe('Get available orders', () => {
  let app, customer, owner, rider, restaurant, pendingOrder, availableOrder
  beforeAll(async () => {
    app = await getApp()
    customer = await getLoggedInCustomer()
    owner = await getLoggedInOwner()
    rider = await getLoggedInRider()
    restaurant = await getFirstRestaurantOfOwner(owner)
    pendingOrder = await createTestOrder(customer, restaurant)
    availableOrder = await createConfirmedOrder(app, owner, customer, restaurant)
  })
  it('Should return 401 if not logged in', async () => {
    const response = await request(app).get('/orders/available').send()
    expect(response.status).toBe(401)
  })
  it('Should return 403 when logged in as a customer', async () => {
    const response = await request(app).get('/orders/available').set('Authorization', `Bearer ${customer.token}`).send()
    expect(response.status).toBe(403)
  })
  it('Should return 403 when logged in as an owner', async () => {
    const response = await request(app).get('/orders/available').set('Authorization', `Bearer ${owner.token}`).send()
    expect(response.status).toBe(403)
  })
  it('Should return 200 when logged in as a rider', async () => {
    const response = await request(app).get('/orders/available').set('Authorization', `Bearer ${rider.token}`).send()
    expect(response.status).toBe(200)
    expect(Array.isArray(response.body)).toBe(true)
  })
  it('Should include confirmed orders with sentAt null', async () => {
    const response = await request(app).get('/orders/available').set('Authorization', `Bearer ${rider.token}`).send()
    expect(response.body.some(order => order.id === availableOrder.id)).toBe(true)
    const returnedOrder = response.body.find(order => order.id === availableOrder.id)
    expect(returnedOrder).toBeDefined()
    expect(returnedOrder.sentAt).toBeNull()
  })
  it('Should not include pending (unconfirmed) orders', async () => {
    const response = await request(app).get('/orders/available').set('Authorization', `Bearer ${rider.token}`).send()
    expect(response.body.some(order => order.id === pendingOrder.id)).toBe(false)
  })
  it('Returned orders should include restaurant and customer summary information', async () => {
    const response = await request(app).get('/orders/available').set('Authorization', `Bearer ${rider.token}`).send()
    const returnedOrder = response.body.find(order => order.id === availableOrder.id)
    expect(returnedOrder).toBeDefined()
    expect(returnedOrder.restaurant).toEqual(expect.objectContaining({
      name: expect.any(String),
      address: expect.any(String),
      postalCode: expect.any(String)
    }))
    expect(returnedOrder.user).toEqual(expect.objectContaining({
      firstName: expect.any(String)
    }))
  })
  it('Should not include orders already sent', async () => {
    await acceptOrder(app, rider, availableOrder)
    const response = await request(app).get('/orders/available').set('Authorization', `Bearer ${rider.token}`).send()
    expect(response.body.some(order => order.id === availableOrder.id)).toBe(false)
  })
  afterAll(async () => {
    await shutdownApp()
  })
})

describe('Accept order', () => {
  let app, customer, owner, restaurant, rider, anotherRider, confirmedOrder, pendingOrder
  beforeAll(async () => {
    app = await getApp()
    customer = await getLoggedInCustomer()
    owner = await getLoggedInOwner()
    restaurant = await getFirstRestaurantOfOwner(owner)
    rider = await getNewLoggedInRider()
    anotherRider = await getNewLoggedInRider()
    confirmedOrder = await createConfirmedOrder(app, owner, customer, restaurant)
    pendingOrder = await createTestOrder(customer, restaurant)
  })
  it('Should return 401 if not logged in', async () => {
    const response = await request(app).patch(`/orders/${confirmedOrder.id}/accept`).send()
    expect(response.status).toBe(401)
  })
  it('Should return 403 when logged in as a customer', async () => {
    const response = await request(app).patch(`/orders/${confirmedOrder.id}/accept`).set('Authorization', `Bearer ${customer.token}`).send()
    expect(response.status).toBe(403)
  })
  it('Should return 403 when logged in as an owner', async () => {
    const response = await request(app).patch(`/orders/${confirmedOrder.id}/accept`).set('Authorization', `Bearer ${owner.token}`).send()
    expect(response.status).toBe(403)
  })
  it('Should return 404 when trying to accept a nonexistent order', async () => {
    const response = await request(app).patch('/orders/invalidOrderId/accept').set('Authorization', `Bearer ${rider.token}`).send()
    expect(response.status).toBe(404)
  })
  it('Should return 409 when trying to accept a pending (unconfirmed) order', async () => {
    const response = await request(app).patch(`/orders/${pendingOrder.id}/accept`).set('Authorization', `Bearer ${rider.token}`).send()
    expect(response.status).toBe(409)
  })
  it('Should return 200 and assign the order to the rider and set sentAt', async () => {
    const response = await request(app).patch(`/orders/${confirmedOrder.id}/accept`).set('Authorization', `Bearer ${rider.token}`).send()
    expect(response.status).toBe(200)
    expect(response.body.riderId).toBe(rider.id)
    expect(response.body.sentAt).toBeDefined()
    expect(response.body.sentAt).not.toBeNull()
  })
  it('Should return 409 when another rider tries to accept an already accepted order', async () => {
    const response = await request(app).patch(`/orders/${confirmedOrder.id}/accept`).set('Authorization', `Bearer ${anotherRider.token}`).send()
    expect(response.status).toBe(409)
  })
  it('Should return 409 when the same rider tries to accept it again', async () => {
    const response = await request(app).patch(`/orders/${confirmedOrder.id}/accept`).set('Authorization', `Bearer ${rider.token}`).send()
    expect(response.status).toBe(409)
  })
  afterAll(async () => {
    await shutdownApp()
  })
})

describe('Deliver order (rider)', () => {
  let app, customer, owner, restaurant, rider, anotherRider, sentOrder, notSentOrder
  beforeAll(async () => {
    app = await getApp()
    customer = await getLoggedInCustomer()
    owner = await getLoggedInOwner()
    restaurant = await getFirstRestaurantOfOwner(owner)
    rider = await getNewLoggedInRider()
    anotherRider = await getNewLoggedInRider()

    sentOrder = await createConfirmedOrder(app, owner, customer, restaurant)
    await acceptOrder(app, rider, sentOrder)

    notSentOrder = await createConfirmedOrder(app, owner, customer, restaurant)
  })
  it('Should return 401 if not logged in', async () => {
    const response = await request(app).patch(`/orders/${sentOrder.id}/riderDeliver/1234`).send()
    expect(response.status).toBe(401)
  })
  it('Should return 403 when logged in as an owner', async () => {
    const response = await request(app).patch(`/orders/${sentOrder.id}/riderDeliver/1234`).set('Authorization', `Bearer ${owner.token}`).send()
    expect(response.status).toBe(403)
  })
  it('Should return 404 when trying to deliver a nonexistent order', async () => {
    const response = await request(app).patch('/orders/invalidOrderId/riderDeliver/1234').set('Authorization', `Bearer ${rider.token}`).send()
    expect(response.status).toBe(404)
  })
  it('Should return 403 when the order is assigned to another rider', async () => {
    const response = await request(app).patch(`/orders/${sentOrder.id}/riderDeliver/1234`).set('Authorization', `Bearer ${anotherRider.token}`).send()
    expect(response.status).toBe(403)
  })
  it('Should return 409 when the order has not been sent yet', async () => {
    const response = await request(app).patch(`/orders/${notSentOrder.id}/riderDeliver/1234`).set('Authorization', `Bearer ${rider.token}`).send()
    expect(response.status).toBe(409)
  })
  it('Should return 200 and mark the order as delivered', async () => {
    const response = await request(app).patch(`/orders/${sentOrder.id}/riderDeliver/1234`).set('Authorization', `Bearer ${rider.token}`).send()
    expect(response.status).toBe(200)
    expect(response.body.deliveredAt).toBeDefined()
    expect(response.body.deliveredAt).not.toBeNull()
  })
  it('Should return 409 when trying to deliver an already delivered order', async () => {
    const response = await request(app).patch(`/orders/${sentOrder.id}/riderDeliver/1234`).set('Authorization', `Bearer ${rider.token}`).send()
    expect(response.status).toBe(409)
  })
  // Solution to october
  it('Should return 409 when the delivery code is incorrect', async () => {
    const response = await request(app).patch(`/orders/${sentOrder.id}/riderDeliver/9999`).set('Authorization', `Bearer ${rider.token}`).send()
    expect(response.status).toBe(409)
  })
  afterAll(async () => {
    await shutdownApp()
  })
})

describe('Update rider comments', () => {
  let app, customer, owner, restaurant, rider, anotherRider, order
  beforeAll(async () => {
    app = await getApp()
    customer = await getLoggedInCustomer()
    owner = await getLoggedInOwner()
    restaurant = await getFirstRestaurantOfOwner(owner)
    rider = await getNewLoggedInRider()
    anotherRider = await getNewLoggedInRider()
    order = await createConfirmedOrder(app, owner, customer, restaurant)
    await acceptOrder(app, rider, order)
  })
  it('Should return 401 if not logged in', async () => {
    const response = await request(app).patch(`/orders/${order.id}/riderComments`).send({ riderComments: 'Left at the door' })
    expect(response.status).toBe(401)
  })
  it('Should return 403 when logged in as an owner', async () => {
    const response = await request(app).patch(`/orders/${order.id}/riderComments`).set('Authorization', `Bearer ${owner.token}`).send({ riderComments: 'Left at the door' })
    expect(response.status).toBe(403)
  })
  it('Should return 403 when the order is not assigned to the requesting rider', async () => {
    const response = await request(app).patch(`/orders/${order.id}/riderComments`).set('Authorization', `Bearer ${anotherRider.token}`).send({ riderComments: 'Left at the door' })
    expect(response.status).toBe(403)
  })
  it('Should return 404 when trying to comment a nonexistent order', async () => {
    const response = await request(app).patch('/orders/invalidOrderId/riderComments').set('Authorization', `Bearer ${rider.token}`).send({ riderComments: 'Left at the door' })
    expect(response.status).toBe(404)
  })
  it('Should return 422 when riderComments exceeds the maximum length', async () => {
    const tooLongComment = 'a'.repeat(501)
    const response = await request(app).patch(`/orders/${order.id}/riderComments`).set('Authorization', `Bearer ${rider.token}`).send({ riderComments: tooLongComment })
    expect(response.status).toBe(422)
    const errorFields = response.body.errors.map(error => error.param)
    expect(errorFields).toContain('riderComments')
  })
  it('Should return 200 and update the rider comments when valid', async () => {
    const response = await request(app).patch(`/orders/${order.id}/riderComments`).set('Authorization', `Bearer ${rider.token}`).send({ riderComments: 'Left at the door, rang the bell' })
    expect(response.status).toBe(200)
    expect(response.body.riderComments).toBe('Left at the door, rang the bell')
  })
  it('Should return 200 and allow clearing the rider comments', async () => {
    const response = await request(app).patch(`/orders/${order.id}/riderComments`).set('Authorization', `Bearer ${rider.token}`).send({ riderComments: '' })
    expect(response.status).toBe(200)
  })
  afterAll(async () => {
    await shutdownApp()
  })
})

describe('Get rider orders', () => {
  let app, customer, owner, restaurant, rider, otherRider, acceptedOrder, deliveredOrder, otherRidersOrder
  beforeAll(async () => {
    app = await getApp()
    customer = await getLoggedInCustomer()
    owner = await getLoggedInOwner()
    restaurant = await getFirstRestaurantOfOwner(owner)
    rider = await getNewLoggedInRider()
    otherRider = await getNewLoggedInRider()

    acceptedOrder = await createConfirmedOrder(app, owner, customer, restaurant)
    await acceptOrder(app, rider, acceptedOrder)

    deliveredOrder = await createConfirmedOrder(app, owner, customer, restaurant)
    await acceptOrder(app, rider, deliveredOrder)
    await request(app).patch(`/orders/${deliveredOrder.id}/riderDeliver/1234`).set('Authorization', `Bearer ${rider.token}`).send()

    otherRidersOrder = await createConfirmedOrder(app, owner, customer, restaurant)
    await acceptOrder(app, otherRider, otherRidersOrder)
  })
  it('Should return 401 if not logged in', async () => {
    const response = await request(app).get('/orders/rider').send()
    expect(response.status).toBe(401)
  })
  it('Should return 403 when logged in as a customer', async () => {
    const response = await request(app).get('/orders/rider').set('Authorization', `Bearer ${customer.token}`).send()
    expect(response.status).toBe(403)
  })
  it('Should return 200 when logged in as a rider', async () => {
    const response = await request(app).get('/orders/rider').set('Authorization', `Bearer ${rider.token}`).send()
    expect(response.status).toBe(200)
    expect(Array.isArray(response.body)).toBe(true)
  })
  it('Should only include orders assigned to the requesting rider', async () => {
    const response = await request(app).get('/orders/rider').set('Authorization', `Bearer ${rider.token}`).send()
    expect(response.body.every(order => order.riderId === rider.id)).toBe(true)
    expect(response.body.some(order => order.id === acceptedOrder.id)).toBe(true)
    expect(response.body.some(order => order.id === deliveredOrder.id)).toBe(true)
    expect(response.body.some(order => order.id === otherRidersOrder.id)).toBe(false)
  })
  it('Should return not-yet-delivered orders before delivered ones', async () => {
    const response = await request(app).get('/orders/rider').set('Authorization', `Bearer ${rider.token}`).send()
    const acceptedIndex = response.body.findIndex(order => order.id === acceptedOrder.id)
    const deliveredIndex = response.body.findIndex(order => order.id === deliveredOrder.id)
    expect(acceptedIndex).toBeGreaterThanOrEqual(0)
    expect(deliveredIndex).toBeGreaterThanOrEqual(0)
    expect(acceptedIndex).toBeLessThan(deliveredIndex)
  })
  afterAll(async () => {
    await shutdownApp()
  })
})

describe('Rider order visibility', () => {
  let app, customer, owner, restaurant, rider, unrelatedRider, order
  beforeAll(async () => {
    app = await getApp()
    customer = await getLoggedInCustomer()
    owner = await getLoggedInOwner()
    restaurant = await getFirstRestaurantOfOwner(owner)
    rider = await getNewLoggedInRider()
    unrelatedRider = await getNewLoggedInRider()
    order = await createConfirmedOrder(app, owner, customer, restaurant)
    await acceptOrder(app, rider, order)
  })
  it('Should return 200 for the assigned rider requesting order details', async () => {
    const response = await request(app).get(`/orders/${order.id}`).set('Authorization', `Bearer ${rider.token}`).send()
    expect(response.status).toBe(200)
    expect(response.body.id).toBe(order.id)
  })
  it('Should return 200 for any other rider requesting order details', async () => {
    const response = await request(app).get(`/orders/${order.id}`).set('Authorization', `Bearer ${unrelatedRider.token}`).send()
    expect(response.status).toBe(200)
    expect(response.body.id).toBe(order.id)
  })
  afterAll(async () => {
    await shutdownApp()
  })
})

// RF Number 1 Third call - october
describe('Request the orders', () => {
  let app, owner, restaurant, customer, rider
  let pendingOrder, availableOrder, acceptedOrder, deliveredOrder
  beforeAll(async () => {
    app = await getApp()
    owner = await getLoggedInOwner()
    restaurant = await getFirstRestaurantOfOwner(owner)
    customer = await getLoggedInCustomer()
    rider = await getLoggedInRider()

    pendingOrder = await createTestOrder(customer, restaurant)
    availableOrder = await createConfirmedOrder(app, owner, customer, restaurant)

    acceptedOrder = await createConfirmedOrder(app, owner, customer, restaurant)
    await acceptOrder(app, rider, acceptedOrder)

    deliveredOrder = await createConfirmedOrder(app, owner, customer, restaurant)
    await acceptOrder(app, rider, deliveredOrder)
    await request(app).patch(`/orders/${deliveredOrder.id}/riderDeliver/1234`).set('Authorization', `Bearer ${rider.token}`).send()
  })
  it('Should return 401 if not logged in', async () => {
    const response = await request(app).get(`/restaurants/${restaurant.id}/orders`).send()
    expect(response.status).toBe(401)
  })
  it('Should return 403 when logged in as a customer', async () => {
    const response = await request(app).get(`/restaurants/${restaurant.id}/orders`).set('Authorization', `Bearer ${customer.token}`).send()
    expect(response.status).toBe(403)
  })
  it('Should return 403 when logged in as an rider', async () => {
    const response = await request(app).get(`/restaurants/${restaurant.id}/orders`).set('Authorization', `Bearer ${rider.token}`).send()
    expect(response.status).toBe(403)
  })
  it('Should return 200 when logged in as an owner', async () => {
    const response = await request(app).get(`/restaurants/${restaurant.id}/orders`).set('Authorization', `Bearer ${owner.token}`).send()
    expect(response.status).toBe(200)
    expect(Array.isArray(response.body)).toBe(true)
  })
  it('Should return orders of a given restaurant', async () => {
    const response = await request(app).get(`/restaurants/${restaurant.id}/orders`).set('Authorization', `Bearer ${owner.token}`).send()
    expect(response.body.every(order => order.restaurantId === restaurant.id)).toBe(true)
  })
  it('Should return orders in due ordering: pending, available, accepted, delivered', async () => {
    const response = await request(app).get(`/restaurants/${restaurant.id}/orders`).set('Authorization', `Bearer ${owner.token}`).send()
    const pendingIndex = response.body.findIndex(order => order.id === pendingOrder.id)
    const availableIndex = response.body.findIndex(order => order.id === availableOrder.id)
    const acceptedIndex = response.body.findIndex(order => order.id === acceptedOrder.id)
    const deliveredIndex = response.body.findIndex(order => order.id === deliveredOrder.id)
    expect(pendingIndex).toBeGreaterThanOrEqual(0)
    expect(availableIndex).toBeGreaterThanOrEqual(0)
    expect(acceptedIndex).toBeGreaterThanOrEqual(0)
    expect(deliveredIndex).toBeGreaterThanOrEqual(0)
    expect(pendingIndex).toBeLessThan(availableIndex)
    expect(availableIndex).toBeLessThan(acceptedIndex)
    expect(acceptedIndex).toBeLessThan(deliveredIndex)
  })
  it('Returned orders should include restaurant, customer, rider and owner summary information', async () => {
    const response = await request(app).get(`/restaurants/${restaurant.id}/orders`).set('Authorization', `Bearer ${owner.token}`).send()
    const returnedOrder = response.body.find(order => order.id === acceptedOrder.id)
    expect(returnedOrder).toBeDefined()
    expect(returnedOrder).toHaveProperty('customerComments')
    expect(returnedOrder).toHaveProperty('riderComments')
    expect(returnedOrder).toHaveProperty('ownerApprove')
    expect(returnedOrder.restaurant).toEqual(expect.objectContaining({
      name: expect.any(String),
      address: expect.any(String),
      postalCode: expect.any(String)
    }))
    expect(returnedOrder.user).toEqual(expect.objectContaining({
      firstName: expect.any(String)
    }))
    expect(returnedOrder.rider).toEqual(expect.objectContaining({
      firstName: expect.any(String)
    }))
  })
  afterAll(async () => {
    await shutdownApp()
  })
})

// RF Number 2 Third call - october
describe('Toggle the order approve by owner', () => {
  let app, customer, owner, rider, order, restaurant
  let pendingOrder, availableOrder
  beforeAll(async () => {
    app = await getApp()
    owner = await getLoggedInOwner()
    customer = await getLoggedInCustomer()
    rider = await getNewLoggedInRider()
    restaurant = await getFirstRestaurantOfOwner(owner)

    pendingOrder = await createTestOrder(customer, restaurant)
    availableOrder = await createConfirmedOrder(app, owner, customer, restaurant)

    order = await createConfirmedOrder(app, owner, customer, restaurant)
    await acceptOrder(app, rider, order)
  })
  it('Should return 401 if not logged in', async () => {
    const response = await request(app).patch(`/orders/${order.id}/toggleApprove`).send()
    expect(response.status).toBe(401)
  })
  it('Should return 403 when logged in as a rider', async () => {
    const response = await request(app).patch(`/orders/${order.id}/toggleApprove`).set('Authorization', `Bearer ${rider.token}`).send()
    expect(response.status).toBe(403)
  })
  it('Should return 403 when logged in as a customer', async () => {
    const response = await request(app).patch(`/orders/${order.id}/toggleApprove`).set('Authorization', `Bearer ${customer.token}`).send()
    expect(response.status).toBe(403)
  })
  it('Should return 404 when trying to approve a nonexistent order', async () => {
    const response = await request(app).patch('/orders/invalidOrderId/toggleApprove').set('Authorization', `Bearer ${owner.token}`).send()
    expect(response.status).toBe(404)
  })
  it('Should return 409 when trying to approve a pending order', async () => {
    const response = await request(app).patch(`/orders/${pendingOrder.id}/toggleApprove`).set('Authorization', `Bearer ${owner.token}`).send()
    expect(response.status).toBe(409)
  })
  it('Should return 409 when trying to approve an available order', async () => {
    const response = await request(app).patch(`/orders/${availableOrder.id}/toggleApprove`).set('Authorization', `Bearer ${owner.token}`).send()
    expect(response.status).toBe(409)
  })
  it('Should return 200 and approve by owner to false, then true', async () => {
    const response = await request(app).patch(`/orders/${order.id}/toggleApprove`).set('Authorization', `Bearer ${owner.token}`).send()
    expect(response.status).toBe(200)
    expect(response.body.ownerApprove).toBe(false)
    const response2 = await request(app).patch(`/orders/${order.id}/toggleApprove`).set('Authorization', `Bearer ${owner.token}`).send()
    expect(response2.status).toBe(200)
    expect(response2.body.ownerApprove).toBe(true)
  })
  afterAll(async () => {
    await shutdownApp()
  })
})

// RF Number 3 Third call - october
describe('Request the orders accepted by a rider', () => {
  let app, owner, customer, rider, restaurant
  let acceptedOrder, deliveredOrder
  beforeAll(async () => {
    app = await getApp()
    owner = await getLoggedInOwner()
    restaurant = await getFirstRestaurantOfOwner(owner)
    customer = await getLoggedInCustomer()
    rider = await getLoggedInRider()

    acceptedOrder = await createConfirmedOrder(app, owner, customer, restaurant)
    await acceptOrder(app, rider, acceptedOrder)

    deliveredOrder = await createConfirmedOrder(app, owner, customer, restaurant)
    await acceptOrder(app, rider, deliveredOrder)
    await request(app).patch(`/orders/${deliveredOrder.id}/riderDeliver/1234`).set('Authorization', `Bearer ${rider.token}`).send()
  })
  it('Should return 401 if not logged in', async () => {
    const response = await request(app).get(`/orders/rider/${rider.id}`).send()
    expect(response.status).toBe(401)
  })
  it('Should return 403 when logged in as a customer', async () => {
    const response = await request(app).get(`/orders/rider/${rider.id}`).set('Authorization', `Bearer ${customer.token}`).send()
    expect(response.status).toBe(403)
  })
  it('Should return 403 when logged in as an rider', async () => {
    const response = await request(app).get(`/orders/rider/${rider.id}`).set('Authorization', `Bearer ${rider.token}`).send()
    expect(response.status).toBe(403)
  })
  it('Should return 200 when logged in as an owner', async () => {
    const response = await request(app).get(`/orders/rider/${rider.id}`).set('Authorization', `Bearer ${owner.token}`).send()
    expect(response.status).toBe(200)
    expect(Array.isArray(response.body)).toBe(true)
  })
  it('Should return orders of a given rider', async () => {
    const response = await request(app).get(`/orders/rider/${rider.id}`).set('Authorization', `Bearer ${owner.token}`).send()
    expect(response.body.every(order => order.riderId === rider.id)).toBe(true)
  })
  it('Should return orders in due ordering: delivered, accepted', async () => {
    const response = await request(app).get(`/orders/rider/${rider.id}`).set('Authorization', `Bearer ${owner.token}`).send()
    const acceptedIndex = response.body.findIndex(order => order.id === acceptedOrder.id)
    const deliveredIndex = response.body.findIndex(order => order.id === deliveredOrder.id)
    expect(acceptedIndex).toBeGreaterThanOrEqual(0)
    expect(deliveredIndex).toBeGreaterThanOrEqual(0)
    expect(deliveredIndex).toBeLessThan(acceptedIndex)
  })
  afterAll(async () => {
    await shutdownApp()
  })
})

// RF Number 4 Third call - october
describe('Disqualify a rider', () => {
  let app, customer, owner, rider, restaurant
  let deliveredOrder, deliveredOrder2
  let disqualifiedRider
  beforeAll(async () => {
    app = await getApp()
    owner = await getLoggedInOwner()
    customer = await getLoggedInCustomer()
    rider = await getNewLoggedInRider()
    restaurant = await getFirstRestaurantOfOwner(owner)

    disqualifiedRider = await createDisqualifiedRider(app, owner)

    deliveredOrder = await createConfirmedOrder(app, owner, customer, restaurant)
    await acceptOrder(app, rider, deliveredOrder)
    await request(app).patch(`/orders/${deliveredOrder.id}/riderDeliver/1234`).set('Authorization', `Bearer ${rider.token}`).send()

    deliveredOrder2 = await createConfirmedOrder(app, owner, customer, restaurant)
    await acceptOrder(app, rider, deliveredOrder2)
    await request(app).patch(`/orders/${deliveredOrder2.id}/riderDeliver/1234`).set('Authorization', `Bearer ${rider.token}`).send()
  })
  it('Should return 401 if not logged in', async () => {
    const response = await request(app).patch(`/orders/rider/${rider.id}/disqualify`).send()
    expect(response.status).toBe(401)
  })
  it('Should return 403 when logged in as a rider', async () => {
    const response = await request(app).patch(`/orders/rider/${rider.id}/disqualify`).set('Authorization', `Bearer ${rider.token}`).send()
    expect(response.status).toBe(403)
  })
  it('Should return 403 when logged in as a customer', async () => {
    const response = await request(app).patch(`/orders/rider/${rider.id}/disqualify`).set('Authorization', `Bearer ${customer.token}`).send()
    expect(response.status).toBe(403)
  })
  it('Should return 404 when trying to disqualify a non-existent rider', async () => {
    const response = await request(app).patch('/orders/rider/noRider/disqualify').set('Authorization', `Bearer ${owner.token}`).send()
    expect(response.status).toBe(404)
  })
  it('Should return 409 when trying to disqualify an already disqualified rider', async () => {
    const response = await request(app).patch(`/orders/rider/${disqualifiedRider.id}/disqualify`).set('Authorization', `Bearer ${owner.token}`).send()
    expect(response.status).toBe(409)
  })
  it('Should return 409 when trying to disqualify a good rider', async () => {
    // No dis-approved orders
    const response = await request(app).patch(`/orders/rider/${rider.id}/disqualify`).set('Authorization', `Bearer ${owner.token}`).send()
    expect(response.status).toBe(409)
    // There's only one dis-approved order
    await request(app).patch(`/orders/${deliveredOrder.id}/toggleApprove`).set('Authorization', `Bearer ${owner.token}`).send()
    const response2 = await request(app).patch(`/orders/rider/${rider.id}/disqualify`).set('Authorization', `Bearer ${owner.token}`).send()
    expect(response2.status).toBe(409)
  })
  it('Should return 200 after disqualifying a bad rider', async () => {
    // There's two dis-approved orders
    await request(app).patch(`/orders/${deliveredOrder2.id}/toggleApprove`).set('Authorization', `Bearer ${owner.token}`).send()
    const response = await request(app).patch(`/orders/rider/${rider.id}/disqualify`).set('Authorization', `Bearer ${owner.token}`).send()
    expect(response.status).toBe(200)
    expect(response.body.isQualifiedRider).toBe(false)
  })
  afterAll(async () => {
    await shutdownApp()
  })
})
