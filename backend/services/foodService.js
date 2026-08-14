import Food from '../models/Food.js';
import Category from '../models/Category.js';
import ApiError from '../utils/ApiError.js';

export const getAllFoods = async (query) => {
  const { category, search, sort, minPrice, maxPrice, page = 1, limit = 8 } = query;

  const filter = {};
  if (category) filter.category = category;
  if (search) filter.$text = { $search: search };
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  let sortOption = { createdAt: -1 };
  if (sort === 'price_asc') sortOption = { price: 1 };
  if (sort === 'price_desc') sortOption = { price: -1 };

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.max(1, Number(limit));
  const skip = (pageNum - 1) * limitNum;

  const [foods, total] = await Promise.all([
    Food.find(filter).populate('category', 'name image').sort(sortOption).skip(skip).limit(limitNum),
    Food.countDocuments(filter),
  ]);

  return {
    foods,
    pagination: {
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      limit: limitNum,
    },
  };
};

export const getFoodById = async (id) => {
  const food = await Food.findById(id).populate('category', 'name image');
  if (!food) {
    throw new ApiError(404, 'Food not found');
  }
  return food;
};

export const createFood = async (data) => {
  const categoryExists = await Category.findById(data.category);
  if (!categoryExists) {
    throw new ApiError(400, 'Referenced category does not exist');
  }
  const food = await Food.create(data);
  return food.populate('category', 'name image');
};
export const updateFood = async (id, data) => {
  if (data.category) {
    const categoryExists = await Category.findById(data.category);
    if (!categoryExists) {
      throw new ApiError(400, 'Referenced category does not exist');
    }
  }

  const food = await Food.findByIdAndUpdate(id, data, {
    returnDocument: 'after',
    runValidators: true,
  }).populate('category', 'name image');

  if (!food) {
    throw new ApiError(404, 'Food not found');
  }
  return food;
};

export const deleteFood = async (id) => {
  const food = await Food.findByIdAndDelete(id);
  if (!food) {
    throw new ApiError(404, 'Food not found');
  }
  return food;
};