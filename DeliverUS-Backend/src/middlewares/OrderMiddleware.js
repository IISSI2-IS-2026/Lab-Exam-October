import { Order, Restaurant, User } from '../models/models.js'
import { Op } from 'sequelize'

const checkOrderCustomer = async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.orderId)
    if (order && order.userId === req.user.id) {
      return next()
    }
    return res.status(403).send('Not enough privileges. This order does not belong to you')
  } catch (err) {
    return res.status(500).send(err)
  }
}

const checkRestaurantExists = async (req, res, next) => {
  return next()
}

const checkOrderOwnership = async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.orderId, {
      include: {
        model: Restaurant,
        as: 'restaurant'
      }
    })
    if (order && req.user.id === order.restaurant.userId) {
      return next()
    }
    return res.status(403).send('Not enough privileges. This entity does not belong to you')
  } catch (err) {
    return res.status(500).send(err)
  }
}

const checkOrderVisible = (req, res, next) => {
  if (req.user.userType === 'owner') {
    return checkOrderOwnership(req, res, next)
  }
  if (req.user.userType === 'customer') {
    return checkOrderCustomer(req, res, next)
  }
  if (req.user.userType === 'rider') {
    return next()
  }
  return res.status(403).send('Not enough privileges')
}

const checkOrderIsPending = async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.orderId)
    if (order && !order.startedAt) {
      return next()
    }
    return res.status(409).send('The order has already been started')
  } catch (err) {
    return res.status(500).send(err.message)
  }
}

const checkOrderCanBeSent = async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.orderId)
    if (order && order.startedAt && !order.sentAt) {
      return next()
    }
    return res.status(409).send('The order cannot be sent')
  } catch (err) {
    return res.status(500).send(err.message)
  }
}

const checkOrderCanBeAccepted = async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.orderId)
    if (order && order.startedAt && !order.sentAt && !order.riderId && !order.deliveredAt) {
      return next()
    }
    return res.status(409).send('The order cannot be accepted')
  } catch (err) {
    return res.status(500).send(err.message)
  }
}

const checkOrderCanBeDeliveredByRider = async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.orderId)
    if (!order) {
      return res.status(404).send('Order not found')
    }
    if (order.riderId && order.riderId !== req.user.id) {
      return res.status(403).send('Not enough privileges. This order is not assigned to you')
    }
    if (order.sentAt && !order.deliveredAt) {
      return next()
    }
    return res.status(409).send('The order cannot be delivered')
  } catch (err) {
    return res.status(500).send(err.message)
  }
}

const checkOrderIsAssignedToRider = async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.orderId)
    if (order && order.riderId === req.user.id) {
      return next()
    }
    return res.status(403).send('Not enough privileges. This order is not assigned to you')
  } catch (err) {
    return res.status(500).send(err)
  }
}

const checkOrderCanBeDelivered = async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.orderId)
    if (order && order.sentAt && !order.deliveredAt) {
      return next()
    }
    return res.status(409).send('The order cannot be delivered')
  } catch (err) {
    return res.status(500).send(err.message)
  }
}

// Already implemented (RF2: approve an order)
const checkOrderNotPendingNotAvailable = async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.orderId)

    const pending = order && !order.startedAt
    const available = order && order.startedAt && !order.sentAt

    if (!(pending || available)) {
      return next()
    }
    return res.status(409).send('Order has not been accepted or delivered')
  } catch (err) {
    return res.status(500).send(err.message)
  }
}
// --

// Solution (E2): need to disqualify a rider (RF4)
const checkApprovedDeliveries = async (req, res, next) => {
  try {
    // 'lastWeek' is the date a week before
    const lastWeek = new Date()
    lastWeek.setDate(lastWeek.getDate() - 7)

    // Add the code to implement the remaining middleware
    // --

  } catch (err) {
    return res.status(500).send(err.message)
  }
}
// --

// Already implemented (RF4: disqualify a rider)
const checkRiderIsQualified = async (req, res, next) => {
  try {
    const rider = await User.findByPk(req.params.riderId)
    if (rider.isQualifiedRider) {
      return next()
    }
    return res.status(409).send('Rider has already been disqualfiied')
  } catch (err) {
    return res.status(500).send(err.message)
  }
}
// --

// Solution (E2): 'checkDeliveryCode' middleware for delivery (RF6) 
// 409 message: 'The delivery code is incorrect'
// --

export {
  checkOrderOwnership,
  checkOrderCustomer,
  checkOrderVisible,
  checkOrderIsPending,
  checkOrderCanBeSent,
  checkOrderCanBeAccepted,
  checkOrderCanBeDeliveredByRider,
  checkOrderIsAssignedToRider,
  checkOrderCanBeDelivered,
  checkRestaurantExists,
  checkOrderNotPendingNotAvailable, // Already implemented (RF2: approve an order)
  checkRiderIsQualified // Already implemented (RF4: disqualify a rider)
  // Solution (E2): export the functions
  // --
}
