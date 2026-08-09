import Category from '../models/Category.js';
import Food from '../models/Food.js';
import ApiError from '../utils/ApiError.js';


export const getAllCategories = async () => {
  return Category.find().sort({ name: 1 });
};

export const getCategoryById = async (id) => {
  const category = await Category.findById(id);
  if (!category) {
    throw new ApiError(404, 'Category not found');
  }
  return category;
};

export const createCategory = async (data) => {
  const existing = await Category.findOne({ name: data.name });
  if (existing) {
    throw new ApiError(409, 'A category with this name already exists');
  }
  return Category.create(data);
};

export const updateCategory = async (id, data) => {
  const category = await Category.findByIdAndUpdate(id, data, {
    returnDocument: 'after',
    runValidators: true,
  });
  if (!category) {
    throw new ApiError(404, 'Category not found');
  }
  return category;
};

export const deleteCategory = async (id) => {
  const category = await Category.findById(id);
  if (!category) {
    throw new ApiError(404, 'Category not found');
  }

  const foodCount = await Food.countDocuments({ category: id });
  if (foodCount > 0) {
    throw new ApiError(
      400,
      `Cannot delete category: ${foodCount} food item(s) still reference it. Reassign or delete those foods first.`
    );
  }

  await Category.findByIdAndDelete(id);
  return category;
};