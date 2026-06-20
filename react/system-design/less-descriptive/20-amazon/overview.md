# Amazon E-commerce UI - System Design Overview

**Level:** Medium-Hard  
**Time to Solve:** 60-75 minutes  
**Tech Stack:** React  

---

## Problem Statement

Design the Amazon frontend experience:
- Homepage with category navigation and deals
- Product listing page (search results, category browsing)
- Product detail page (images, reviews, variants, add to cart)
- Reviews with filters and pagination
- Cart (covered in shopping-cart question — reference it)
- Checkout flow (address, payment, confirmation)
- Order history

---

## Real-World Examples

- Amazon
- Flipkart
- eBay
- Walmart
- Shopify storefronts

---

## What This Tests

| Skill | Why It Matters |
|-------|---------------|
| Faceted search/filter | Multi-dimensional filtering |
| Product detail page complexity | Variants, images, reviews |
| Star rating system | Aggregate + user rating |
| Review pagination | Large datasets |
| URL-driven state | Filters in URL |
| Breadcrumb navigation | Category hierarchy |

---

## What You'll Learn

- Faceted search architecture (multiple filter dimensions)
- Product variant selection (color, size, storage)
- Image gallery with thumbnail strip
- Star rating calculation and display
- Price formatting with deals/strikethrough
- Breadcrumb navigation pattern
- Checkout multi-step form pattern
- Prime badge / delivery estimation display

---

## High-Level Architecture

```
<AmazonApp />
│
├── <Header />
│   ├── <Logo />
│   ├── <SearchBar />
│   ├── <CartIcon count={3} />
│   └── <AccountMenu />
│
├── <ProductListingPage />
│   ├── <Breadcrumb />            (Electronics > Laptops)
│   ├── <FiltersSidebar />        (Brand, Price, Rating, Prime)
│   │   └── <FilterGroup /> × N
│   ├── <SortBar />               (Best Match, Price, Rating)
│   ├── <ProductGrid />
│   │   └── <ProductCard /> × N
│   └── <Pagination />
│
└── <ProductDetailPage />
    ├── <ImageGallery />          (main + thumbnails)
    ├── <ProductInfo />
    │   ├── Title, Brand, Rating
    │   ├── <PriceSection />      (deal price, original, savings)
    │   ├── <VariantSelector />   (Color, Size, Storage)
    │   └── <AddToCart />
    ├── <DeliveryInfo />          (Prime badge, estimated date)
    └── <ReviewsSection />
        ├── <RatingSummary />     (star breakdown chart)
        └── <ReviewList />
```

---

## Data Structure

```javascript
// Product shape
{
  id: "prod_123",
  title: "Apple MacBook Pro 14\"",
  brand: "Apple",
  price: 1999.99,
  originalPrice: 2299.99,
  discount: 13,
  rating: 4.6,
  reviewCount: 2847,
  images: ["url1", "url2", "url3"],
  isPrime: true,
  deliveryDate: "2024-01-18",
  inStock: true,
  variants: {
    colors: [{ label: "Space Gray", value: "space-gray", inStock: true }],
    storage: [{ label: "512GB", value: "512gb", price: 1999.99 }]
  },
  features: ["Apple M3 Pro chip", "18-hour battery"],
  categoryPath: ["Electronics", "Computers", "Laptops"]
}

// Filter state
const [filters, setFilters] = useState({
  brands: [],
  priceRange: [0, 5000],
  minRating: 0,
  isPrime: false,
  sortBy: "relevance"
});

// Selected variant
const [selectedVariants, setSelectedVariants] = useState({
  color: "space-gray",
  storage: "512gb"
});
```

---

## Data Flow

```
User searches "macbook pro":
  → navigate to /search?q=macbook+pro
  → fetch /api/search?q=macbook+pro&page=1&limit=24
  → render product grid
  → render filter options from API (available brands, price range)

User applies filter "Brand: Apple":
  → setFilters({ brands: ["Apple"] })
  → URL: /search?q=macbook+pro&brand=Apple
  → refetch with new filter params

User clicks product:
  → navigate to /product/:id
  → fetch full product data
  → fetch first page of reviews

User selects color "Silver":
  → setSelectedVariants({ ...variants, color: "silver" })
  → price may change
  → stock status may change
  → images may change to show that color

User clicks "Add to Cart":
  → check selected variants are complete
  → POST /api/cart with productId + variants
  → update cart badge count
  → show "Added to Cart" confirmation

User writes a review:
  → star rating selector + text
  → POST /api/reviews
  → optimistically show review
```

---

## Key Concepts to Learn

### 1. Star Rating Display
```javascript
function StarRating({ rating, maxStars = 5 }) {
  return (
    <div className="stars">
      {Array.from({ length: maxStars }, (_, i) => {
        const filled = i + 1 <= Math.floor(rating);
        const partial = !filled && i < rating;
        return (
          <span key={i} className={filled ? "full" : partial ? "partial" : "empty"}>
            ★
          </span>
        );
      })}
      <span>{rating} ({reviewCount.toLocaleString()})</span>
    </div>
  );
}
```

### 2. Variant Selector
```javascript
const handleVariantChange = (type, value) => {
  const newVariants = { ...selectedVariants, [type]: value };
  setSelectedVariants(newVariants);

  // Find matching SKU for new variant combo
  const matchingSKU = product.skus.find(sku =>
    Object.entries(newVariants).every(([k, v]) => sku[k] === v)
  );
  if (matchingSKU) {
    setCurrentPrice(matchingSKU.price);
    setInStock(matchingSKU.inStock);
  }
};
```

### 3. Faceted Filter with URL Sync
```javascript
// Build API query from filters
const buildQueryString = (filters) => {
  const params = new URLSearchParams();
  filters.brands.forEach(b => params.append("brand", b));
  if (filters.minRating) params.set("rating", filters.minRating);
  if (filters.isPrime) params.set("prime", "true");
  params.set("sort", filters.sortBy);
  return params.toString();
};

// In search page
const handleFilterChange = (newFilters) => {
  setFilters(newFilters);
  setSearchParams(buildQueryString(newFilters));
};
```

### 4. Price Formatting
```javascript
const formatPrice = (price) => `$${price.toFixed(2)}`;

// Show deal
<span className="deal-price">{formatPrice(price)}</span>
<span className="original-price">{formatPrice(originalPrice)}</span>
<span className="savings">Save {discount}% ({formatPrice(originalPrice - price)})</span>
```

---

## Implementation Phases

### Phase 1 — Product Listing
- Grid layout
- ProductCard with image, title, price, rating
- Pagination

### Phase 2 — Filters
- Filter sidebar
- Brand, price range, rating, Prime filter
- URL sync

### Phase 3 — Product Detail
- Image gallery with thumbnails
- Variant selector
- Price and stock display

### Phase 4 — Reviews
- Star rating summary (breakdown by star)
- Review list with pagination
- Filter reviews by star rating

### Phase 5 — Cart Integration
- Add to cart
- Cart count badge
- "Added to Cart" modal confirmation

---

## Performance Considerations

- Lazy load product images in grid
- Debounce price range slider
- Cache search results by query+filters
- Skeleton loading on product cards
- Pre-render above-fold images
