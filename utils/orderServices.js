// Format date as MM/DD/YYYY
const dateFormatter = (date) => {
  const options = { year: "numeric", month: "2-digit", day: "2-digit" };
  return new Date(date).toLocaleDateString("en-US", options);
};

// Get date vs sales data for the dashboard
exports.getDateVsSalesData = (orders) => {
  const map = new Map();

  orders.forEach((order) => {
    const date = dateFormatter(order.orderDate);
    const total = order.orderQty * order.productId.pricePerUnit;

    map.set(date, (map.get(date) || 0) + total);
  });

  // Now convert map to array
  const data = Array.from(map.entries()).map(([date, totalSales]) => ({
    date,
    totalSales,
  }));

  return data;
};

// Get category vs sales data for the dashboard
exports.getCategoryVsSalesData = (orders) => {
  const map = new Map();

  orders.forEach((order) => {
    const category = order.productId.category;
    const total = order.orderQty * order.productId.pricePerUnit;

    map.set(category, (map.get(category) || 0) + total);
  });

  const data = Array.from(map.entries()).map(([category, totalSales]) => ({
    category,
    totalSales,
  }));

  return data;
};

//"sugar",
// "spices",
// "fruits",
//"vegetables",
//"pulses",
//];
