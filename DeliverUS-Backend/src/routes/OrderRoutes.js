import OrderController from '../controllers/OrderController.js'
import * as OrderValidation from '../controllers/validation/OrderValidation.js'
import { hasRole, isLoggedIn } from '../middlewares/AuthMiddleware.js'
import { checkEntityExists } from '../middlewares/EntityMiddleware.js'
import * as OrderMiddleware from '../middlewares/OrderMiddleware.js'
import { handleValidation } from '../middlewares/ValidationHandlingMiddleware.js'
// Solution: adding User model
import { Order, User } from '../models/models.js'

const loadFileRoutes = function (app) {
  app.route('/orders/:orderId/confirm')
    .patch(
      isLoggedIn,
      hasRole('owner'),
      checkEntityExists(Order, 'orderId'),
      OrderMiddleware.checkOrderOwnership,
      OrderMiddleware.checkOrderIsPending,
      OrderController.confirm)

  app.route('/orders/:orderId/send')
    .patch(
      isLoggedIn,
      hasRole('owner'),
      checkEntityExists(Order, 'orderId'),
      OrderMiddleware.checkOrderOwnership,
      OrderMiddleware.checkOrderCanBeSent,
      OrderController.send)

  app.route('/orders/:orderId/deliver')
    .patch(
      isLoggedIn,
      hasRole('owner'),
      checkEntityExists(Order, 'orderId'),
      OrderMiddleware.checkOrderOwnership,
      OrderMiddleware.checkOrderCanBeDelivered,
      OrderController.deliver)

  app.route('/orders/available')
    .get(
      isLoggedIn,
      hasRole('rider'),
      OrderController.findAvailableOrders)

  app.route('/orders/rider')
    .get(
      isLoggedIn,
      hasRole('rider'),
      OrderController.indexRider)

  app.route('/orders/:orderId/accept')
    .patch(
      isLoggedIn,
      hasRole('rider'),
      checkEntityExists(Order, 'orderId'),
      OrderMiddleware.checkOrderCanBeAccepted,
      OrderController.accept)

  // Solution (E2): adapt to check the delivery code (RF6)
  app.route('/orders/:orderId/riderDeliver/:deliveryCode')
    .patch(
      isLoggedIn,
      hasRole('rider'),
      checkEntityExists(Order, 'orderId'),
      OrderMiddleware.checkOrderCanBeDeliveredByRider,
      OrderController.deliver)
  // 

  app.route('/orders/:orderId/riderComments')
    .patch(
      isLoggedIn,
      hasRole('rider'),
      checkEntityExists(Order, 'orderId'),
      OrderMiddleware.checkOrderIsAssignedToRider,
      OrderValidation.updateRiderComments,
      handleValidation,
      OrderController.updateRiderComments)

  // Solution (E2): add route to approve or not the order (RF2)
  // --

  // Already implemented: route to get the accepted orders by a rider (FR3)
  app.route('/orders/rider/:riderId')
    .get(
      isLoggedIn,
      hasRole('owner'),
      checkEntityExists(User, 'riderId'),
      OrderController.indexOrdersFromRider)
  // --

  // Solution (E2): add route to disqualify a rider (RF6)
  // --

  app.route('/orders/:orderId')
    .get(
      isLoggedIn,
      checkEntityExists(Order, 'orderId'),
      OrderMiddleware.checkOrderVisible,
      OrderController.show)
}

export default loadFileRoutes
