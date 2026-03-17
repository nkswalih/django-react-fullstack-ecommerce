// components/AdminOrders/AdminOrdersTable.jsx

import React from 'react';

const AdminOrdersTable = ({
  filteredOrders,
  handleViewDetails,
  handleUpdateStatus,
  formatDate,
  formatPrice,
  getStatusColor,
  getPaymentColor,
  statusOptions,
  showDetailsModal,
  setShowDetailsModal,
  selectedOrder,
  setSelectedOrder,
  searchTerm,
  selectedStatus,
  selectedPaymentMethod,
  dateFilter
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {filteredOrders.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        #{order.id}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(order.date)}
                      </div>
                      <div className="mt-1">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPaymentColor(order.paymentMethod || order.customerInfo?.paymentMethod)}`}>
                          {order.paymentMethod || order.customerInfo?.paymentMethod || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {order.userName || order.customerInfo?.name || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.userEmail || order.customerInfo?.email || 'N/A'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {order.items?.length || 0} items
                    </div>
                    <div className="text-sm text-gray-500">
                      {order.items?.slice(0, 2).map((item, idx) => (
                        <span key={idx} className="block truncate max-w-[200px]">
                          {item.quantity}x {item.productName}
                        </span>
                      ))}
                      {order.items?.length > 2 && (
                        <span className="text-gray-400">+{order.items.length - 2} more</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {formatPrice(order.total)}
                    </div>
                    <div className="text-sm text-gray-500">
                      Subtotal: {formatPrice(order.subtotal)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col space-y-2">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        <select
                          value={order.status}
                          onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                          className="text-xs border border-gray-300 rounded px-1 py-1 focus:ring-0 bg-transparent border-none"
                        >
                          {statusOptions.map(status => (
                            <option key={status} value={status}>
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </option>
                          ))}
                        </select>
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleViewDetails(order)}
                      className="text-blue-600 hover:text-blue-900 transition-colors px-3 py-1 rounded hover:bg-blue-50"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📦</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No orders found</h2>
          <p className="text-gray-600 mb-4">
            {searchTerm || selectedStatus !== 'all' || selectedPaymentMethod !== 'all' || dateFilter !== 'all'
              ? 'Try adjusting your filters' 
              : 'No orders have been placed yet'}
          </p>
        </div>
      )}

      {/* Order Details Modal */}
      {showDetailsModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Order Details</h3>
                  <p className="text-sm text-gray-500">#{selectedOrder.id}</p>
                </div>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedOrder(null);
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Order Summary */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Order Summary</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Order Date</p>
                      <p className="font-medium">{formatDate(selectedOrder.date)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <select
                        value={selectedOrder.status}
                        onChange={(e) => handleUpdateStatus(selectedOrder.id, e.target.value)}
                        className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      >
                        {statusOptions.map(status => (
                          <option key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Payment Method</p>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPaymentColor(selectedOrder.paymentMethod || selectedOrder.customerInfo?.paymentMethod)}`}>
                        {selectedOrder.paymentMethod || selectedOrder.customerInfo?.paymentMethod || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Order Total</p>
                      <p className="font-medium">{formatPrice(selectedOrder.total)}</p>
                    </div>
                  </div>
                </div>

                {/* Customer Information */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Customer Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="font-medium">{selectedOrder.userName || selectedOrder.customerInfo?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{selectedOrder.userEmail || selectedOrder.customerInfo?.email || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium">{selectedOrder.customerInfo?.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Shipping Address</p>
                      <p className="font-medium">
                        {selectedOrder.customerInfo?.address}, {selectedOrder.customerInfo?.city}, 
                        {selectedOrder.customerInfo?.state} - {selectedOrder.customerInfo?.pincode}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Order Items ({selectedOrder.items?.length || 0})</h4>
                  <div className="space-y-4">
                    {selectedOrder.items?.map((item, index) => (
                      <div key={index} className="flex items-center border-b pb-4">
                        <div className="h-16 w-16 flex-shrink-0">
                          <img
                            src={item.productImage}
                            alt={item.productName}
                            className="h-16 w-16 rounded-lg object-cover"
                          />
                        </div>
                        <div className="ml-4 flex-1">
                          <div className="flex justify-between">
                            <div>
                              <h5 className="text-sm font-medium text-gray-900">{item.productName}</h5>
                              <p className="text-sm text-gray-500">{item.productBrand}</p>
                              <p className="text-sm text-gray-500">
                                Storage: {item.storage} • Qty: {item.quantity}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-gray-900">{formatPrice(item.productPrice)}</p>
                              <p className="text-sm text-gray-500">Total: {formatPrice(item.itemTotal)}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Totals */}
                <div className="border-t pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">{formatPrice(selectedOrder.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-medium">{formatPrice(selectedOrder.shipping || 0)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-semibold border-t pt-2">
                      <span>Total</span>
                      <span>{formatPrice(selectedOrder.total)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end pt-6 border-t mt-6">
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedOrder(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersTable;