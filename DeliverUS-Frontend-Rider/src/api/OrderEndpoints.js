import { get, patch } from './helpers/ApiRequestsHelper'

function getAvailableOrders() {
  return get('orders/available')
}

function getMyOrders() {
  return get('orders/rider')
}

function getOrderDetail(id) {
  return get(`orders/${id}`)
}

function acceptOrder(id) {
  return patch(`orders/${id}/accept`)
}

function updateRiderComments(id, riderComments) {
  return patch(`orders/${id}/riderComments`, { riderComments })
}

function confirmPickup(id) {
  return patch(`orders/${id}/pickup`)
}

// Solution (E5): PATCH '/orders/:orderId/riderDeliver/:deliveryCode' endpoint
// --

export {
  getAvailableOrders,
  getMyOrders,
  getOrderDetail,
  acceptOrder,
  updateRiderComments,
  confirmPickup
  // Solution (E5): Export the needed endpoints, if any
}
