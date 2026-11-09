import {
  get,
  post,
  put,
  destroy,
  patch // Already implemented
} from './helpers/ApiRequestsHelper'

function getAll() {
  return get('users/myrestaurants')
}

function getDetail(id) {
  return get(`restaurants/${id}`)
}

function getRestaurantCategories() {
  return get('restaurantCategories')
}

function create(data) {
  return post('restaurants', data)
}

function update(id, data) {
  return put(`restaurants/${id}`, data)
}

function remove(id) {
  return destroy(`restaurants/${id}`)
}

function getOrderDetail(id) {
  return get(`orders/${id}`)
}

// Already implemented: accepted orders by a rider (RF-3)
function getOrderFromRider(id) {
  return get(`/orders/rider/${id}`)
}
// --

// Already implemented: Invoking the backend (RF-4: disqualify a rider)
function disqualifyRider(id) {
  return patch(`/orders/rider/${id}/disqualify`)
}
// --

// Solution (E4): GET 'restaurants/:restaurantId/orders' endpoint
// --

// Solution (E4): PATCH 'orders/:orderId/toggleApprove' endpoint
// --

export {
  getAll,
  getDetail,
  getRestaurantCategories,
  create,
  update,
  remove,
  getOrderDetail,
  getOrderFromRider, // Already implemented: accepted orders by rider (E4)
  disqualifyRider // Already implemented: disqualify a rider (E4)
  // Solution (E4 y E5): to export the needed endpoints, if any
  // --
}
