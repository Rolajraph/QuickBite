import * as foodService from '../services/foodService.js';

export const getFoods = async (req, res) => {
  const { foods, pagination } = await foodService.getAllFoods(req.query);
  res.status(200).json({ success: true, results: foods.length, pagination, data: { foods } });
};

export const getFood = async (req, res) => {
  const food = await foodService.getFoodById(req.params.id);
  res.status(200).json({ success: true, data: { food } });
};

export const createFood = async (req, res) => {
  const foodData = { ...req.body };
  if (req.file) {
    foodData.image = req.file.path; // Cloudinary URL
  }
  const food = await foodService.createFood(foodData);
  res.status(201).json({
    success: true,
    message: 'Food item created successfully',
    data: { food },
  });
};

export const updateFood = async (req, res) => {
  const foodData = { ...req.body };
  if (req.file) {
    foodData.image = req.file.path;
  }
  const food = await foodService.updateFood(req.params.id, foodData);
  res.status(200).json({
    success: true,
    message: 'Food item updated successfully',
    data: { food },
  });
};

export const deleteFood = async (req, res) => {
  await foodService.deleteFood(req.params.id);
  res.status(200).json({
    success: true,
    message: 'Food item deleted successfully',
  });
};