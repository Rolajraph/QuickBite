import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getFoodsRequest } from "../../api/foodApi";
import { getCategoriesRequest } from "../../api/categoryApi";
import { formatCurrency } from "../../utils/formatCurrency";
import heroImage from "../../assets/images/hero.jpg";
import "./Home.css";
import heroImage2 from "../../assets/images/hero2.jpg";

const Home = () => {
  const [featuredFoods, setFeaturedFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const heroImages = [heroImage, heroImage2];

  const [activeHeroIndex, setActiveHeroIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveHeroIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [foodsRes, categoriesRes] = await Promise.all([
          getFoodsRequest(),
          getCategoriesRequest(),
        ]);
        // Feature the top-rated items
        // Feature local dishes, highest-rated first
        const localDishes = foodsRes.data.data.foods.filter(
          (food) => food.category.name === "Local Dishes",
        );
        const sorted = [...localDishes].sort((a, b) => b.rating - a.rating);
        setFeaturedFoods(sorted.slice(0, 4));
        setCategories(categoriesRes.data.data.categories);
      } catch {
        // Home page degrades gracefully — sections just don't render if this fails
      }
    };
    loadHomeData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/menu?search=${encodeURIComponent(searchTerm)}`);
  };

  return (
    <div>
      <section className="home-hero">
        {heroImages.map((img, index) => (
          <img
            key={img}
            src={img}
            alt=""
            className={`home-hero__bg ${index === activeHeroIndex ? "home-hero__bg--active" : ""}`}
          />
        ))}
        <div className="home-hero__overlay" />
        <div className="home-hero__content">
          <h1>Great food, delivered fast</h1>
          <p>
            Order from the best local vendors near you — fresh meals, quick
            delivery, right to your door.
          </p>
          <div className="home-hero__actions">
            <Link to="/menu" className="home-hero__btn-primary">
              Order Now
            </Link>
            <Link to="/register" className="home-hero__btn-secondary">
              Get Started
            </Link>
          </div>
        </div>
      </section>

      <div className="home-search">
        <form className="home-search__bar" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search for a dish..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>
      </div>

      <section className="home-section">
        <h2 className="brush-underline">Popular Categories</h2>
        <div className="home-categories">
          {categories.map((cat) => (
            <Link
              key={cat._id}
              to={`/menu?category=${cat._id}`}
              className="home-category-chip"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </section>

      {featuredFoods.length > 0 && (
        <section className="home-section">
          <h2 className="brush-underline">Featured Meals</h2>
          <div className="menu__grid" style={{ marginTop: "var(--space-6)" }}>
            {featuredFoods.map((food) => (
              <div className="food-card" key={food._id}>
                <img
                  src={food.image}
                  alt={food.name}
                  className="food-card__image"
                />
                <div className="food-card__body">
                  <span className="food-card__category">
                    {food.category.name}
                  </span>
                  <h3 className="food-card__name">{food.name}</h3>
                  <p className="food-card__price">
                    {formatCurrency(food.price)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="home-cta">
        <h2>Hungry? Let's fix that.</h2>
        <p>Browse our full menu and get your favorites delivered today.</p>
        <Link to="/menu" className="home-hero__btn-primary">
          Browse Menu
        </Link>
      </div>
    </div>
  );
};

export default Home;
