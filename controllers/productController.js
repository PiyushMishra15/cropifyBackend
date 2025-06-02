const Product = require("../models/productSchema");
const uploadImageToCloudinary = require("../utils/CloudinaryServices");
const calculateDistance = require("../utils/calculateDistance");

exports.addProduct = async (req, res) => {
  try {
    const sellerId = req.cookies?.sellerId;
    req.body.sellerId = sellerId;

    const uploadedImage = req.file;

    console.log(uploadedImage);

    if (!uploadedImage) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    try {
      let cloudRes = await uploadImageToCloudinary(uploadedImage.buffer);
      req.body.image = cloudRes.secure_url;
    } catch (error) {
      console.log(error);
      return res.status(500).send({
        message:
          "There was a problem communicating with Cloudinary during the image upload.",
      }); // ✅ Added return
    }

    let product = new Product(req.body);
    await product.save();

    return res.status(200).send({ message: "Product Added Successfully" }); // ✅ Also return here
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Something went wrong!" }); // ✅ Also return here
  }
};

//get all products by  category  /products/category/fruits/77.1025/28.7041?page=1&products_per_page=10
exports.getProductDataByCategory = async (req, res) => {
  try {
    // Parse query parameters safely
    const page = parseInt(req.query.page) || 1;
    const productsPerPage = parseInt(req.query.products_per_page) || 10;
    const lng = parseFloat(req.query.lng);
    const lat = parseFloat(req.query.lat);
    const category = req.params.category;

    // Validate required coordinates
    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ message: "Invalid coordinates" });
    }

    const skip = (page - 1) * productsPerPage;

    // Count total products in category
    const totalProduct = await Product.countDocuments({ category });

    // Check for more pages
    const hasMore = totalProduct > page * productsPerPage;

    // Fetch products
    const products = await Product.find({ category })
      .sort({ date: -1 })
      .skip(skip)
      .limit(productsPerPage)
      .select(
        "name image brand measuringUnit pricePerUnit minimumOrderQuantity location sellerId deliveryRadius"
      )
      .lean();

    const deliverableProducts = [];
    const nonDeliverableProducts = [];

    const userCoordinates = [lng, lat];

    products.forEach((product) => {
      const distance = calculateDistance(
        userCoordinates,
        product.location.coordinates
      );

      if (distance <= product.deliveryRadius) {
        deliverableProducts.push(product);
      } else {
        nonDeliverableProducts.push(product);
      }
    });

    return res.status(200).json({
      deliverableProducts,
      nonDeliverableProducts,
      hasMore,
    });
  } catch (error) {
    console.error("Error fetching products by category:", error);
    return res.status(500).json({ message: "Something went wrong!" });
  }
};

exports.getProductDashboardData = async (req, res) => {
  try {
    let data = await Product.findById(req.params.productId)
      .select(
        "shelfLife quantity description date sellerId image name brand measuringUnit pricePerUnit minimumOrderQuantity location  deliveryRadius"
      )
      .lean();
    res.status(200).send(data);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Something went wrong!" });
  }
};

// Get Product Stocks By Id
exports.getProductStocksById = async (req, res) => {
  try {
    let productQty = await Product.findById(req.params.productId)
      .select("quantity")
      .lean();

    if (!productQty) {
      return res.status(404).send({ message: "Product not found" });
    }

    res.status(200).send({ quantityLeft: productQty.quantity });
  } catch (error) {
    res.status(500).send("Something went wrong!");
    console.log(error);
  }
};

exports.getProductById = async (req, res) => {
  try {
    let product = await Product.findById(req.params.productId)
      .select(
        "name image brand measuringUnit pricePerUnit minimumOrderQuantity location sellerId deliveryRadius"
      )
      .lean();
    if (!product) {
      return res.status(404).send({ message: "Product not found" });
    }
    res.status(200).send(product);
  } catch (error) {
    console.log(error);
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const sellerId = req.cookies?.sellerId;

    let product = await Product.findById(req.params.productId);

    if (!product) {
      return res.status(404).send({ message: "Product not found" });
    }

    if (product.sellerId != sellerId) {
      return res
        .status(403)
        .send({ message: "You are not authorized to delete this product" });
    }

    await Product.findByIdAndDelete(req.params.productId);
    // console.log(data);
    res.status(200).send({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).send({ message: "Something went wrong!" });
  }
};

///seller dashboad=rd

exports.getSellerDashboardProducts = async (req, res) => {
  try {
    const sellerId = req.sellerId;

    if (!sellerId) {
      return res
        .status(401)
        .send({ message: "Unauthorized: seller ID missing" });
    }

    const products = await Product.find({ sellerId })
      .select(
        "name image brand measuringUnit pricePerUnit minimumOrderQuantity  location coordinates sellerId deliveryRadius quantity shelfLife description date"
      )
      .lean();

    return res.status(200).send(products);
  } catch (error) {
    console.error("Error in getSellerDashboardProducts:", error);
    return res.status(500).send({ message: "Something went wrong!" });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const sellerId = req.cookies?.sellerId;
    console.log(sellerId);

    const uploadedImage = req.file;

    console.log(uploadedImage);

    if (uploadedImage) {
      try {
        let cloudRes = await uploadImageToCloudinary(uploadedImage.buffer);
        req.body.image = cloudRes.secure_url;
      } catch (error) {
        console.log(error);
        return res.status(500).send({
          message:
            "There was a problem communicating with Cloudinary during the image upload.",
        });
      }
    }

    let product = await Product.findById(req.params.productId);

    if (!product) {
      return res.status(404).send({ message: "Product not found" });
    }

    if (product.sellerId != sellerId) {
      return res
        .status(403)
        .send({ message: "You are not authorized to update this product" });
    }
    const updatedFields = {};

    let {
      image,
      name,
      category,
      description,
      pricePerUnit,
      measuringUnit,
      minimumOrderQuantity,
      location,
      quantity,
      shelfLife,
      deliveryRadius,
    } = req.body;

    pricePerUnit = parseFloat(pricePerUnit);
    minimumOrderQuantity = parseInt(minimumOrderQuantity);
    quantity = parseInt(quantity);
    deliveryRadius = parseInt(deliveryRadius);
    location.coordinates = location.coordinates.map((coord) =>
      parseFloat(coord)
    );

    console.log(updatedFields);

    if (image && image !== product.image) {
      updatedFields.image = image;
    }
    if (name && name !== product.name) {
      updatedFields.name = name;
    }
    if (category && category !== product.category) {
      updatedFields.category = category;
    }
    if (description && description !== product.description) {
      updatedFields.description = description;
    }
    if (pricePerUnit && pricePerUnit !== product.pricePerUnit) {
      updatedFields.pricePerUnit = pricePerUnit;
    }
    if (measuringUnit && measuringUnit !== product.measuringUnit) {
      updatedFields.measuringUnit = measuringUnit;
    }
    if (deliveryRadius && deliveryRadius !== product.deliveryRadius) {
      updatedFields.deliveryRadius = deliveryRadius;
    }
    if (
      minimumOrderQuantity &&
      minimumOrderQuantity !== product.minimumOrderQuantity
    ) {
      updatedFields.minimumOrderQuantity = minimumOrderQuantity;
    }
    if (
      location &&
      location.coordinates &&
      location.coordinates.length === 2 &&
      (location.coordinates[0] !== product.location.coordinates[0] ||
        location.coordinates[1] !== product.location.coordinates[1])
    ) {
      updatedFields.location = {
        type: "Point",
        coordinates: location.coordinates,
      };
    }
    if (quantity && quantity !== product.quantity) {
      updatedFields.quantity = quantity;
    }
    if (shelfLife && shelfLife !== product.shelfLife) {
      updatedFields.shelfLife = shelfLife;
    }

    console.log("Updated Fields: ", updatedFields);

    if (Object.keys(updatedFields).length === 0) {
      return res.status(400).send({ message: "No fields to update" });
    }

    await Product.findByIdAndUpdate(req.params.productId, updatedFields);

    res.status(200).send({
      message: "Product Updated Successfully",
    });
  } catch (error) {
    res.status(500).send({ message: "Something went wrong!" });
    console.log(error);
  }
};

exports.getMainProductDataById = async (req, res) => {
  try {
    let product = await Product.findById(req.params.productId)
      .select(
        "name image brand measuringUnit pricePerUnit minimumOrderQuantity location.coordinates sellerId"
      )
      .lean();

    if (!product) {
      return res.status(404).send({ message: "Product not found" });
    }

    res.status(200).send(product);
    // console.log(data);
  } catch (error) {
    res.status(500).send("Something went wrong!");
    console.log(error);
  }
};
