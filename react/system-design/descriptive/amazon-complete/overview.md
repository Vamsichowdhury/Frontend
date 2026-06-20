# Amazon E-Commerce UI — Interview Overview

---

## What Problem Are We Solving?

Design the Amazon frontend — the world's largest e-commerce platform. Users search for products, browse categories, view product details, and purchase. The **Product Detail Page (PDP)** is the core conversion experience.

```
┌──────────────────────────────────────────────────────────────────┐
│  amazon  🔍 Search...              Cart(3)  Sign In  Orders      │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Electronics > Smartphones > Apple               ← breadcrumb   │
│                                                                  │
│  ┌────────────────────┐  ┌───────────────────────────────────┐  │
│  │  📷 Main Image     │  │  Apple iPhone 15 Pro              │  │
│  │  (hover to zoom →  │  │  ★★★★½  4.6  (2,847 ratings)     │  │
│  │   zoomed panel)    │  │                                   │  │
│  │                    │  │  ₹1,29,900   ~~₹1,49,900~~       │  │
│  ├────────────────────┤  │  13% off  Save ₹20,000           │  │
│  │[t1][t2][t3][t4][t5]│  │                                   │  │
│  └────────────────────┘  │  Colour: Natural Titanium         │  │
│                          │  [●Black][●White][●Blue][●Nat●]   │  │
│                          │                                   │  │
│                          │  Storage:  [128GB][256GB●][512GB] │  │
│                          │                                   │  │
│                          │  🟢 In Stock · Only 3 left        │  │
│                          │  🚚 FREE Delivery by Tomorrow     │  │
│                          │  🔒 Prime   [Try Prime Free]      │  │
│                          │                                   │  │
│                          │  [  Add to Cart  ]                │  │
│                          │  [  Buy Now      ]                │  │
│                          └───────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

---

## What Makes Amazon's UI Hard to Build

```
1. Variant selection with SKU lookup
   Color + Storage → specific SKU
   Each combination has different: price, stock, images
   Some combinations are unavailable (out of stock / doesn't exist)
   Selecting an unavailable option must be visually communicated

2. Image zoom (hover-to-magnify)
   Main image + zoom panel side by side
   mousemove event → CSS background-position calculation
   Thumbnail strip → click to change main image

3. Faceted search (multiple filter dimensions)
   Brand AND Price range AND Rating AND Prime AND Delivery speed
   All filters combine (AND logic, not OR)
   URL must encode all active filters (shareable, bookmarkable)
   Price range slider needs debounce (don't refetch on every px drag)

4. Star rating breakdown chart
   Distribution of 1–5 star reviews
   Click a star bar to filter reviews to that rating
   Review sentiment tags ("Good battery", "Poor camera")

5. "Only N left in stock" urgency and delivery estimation
   Stock count affects CTA (Add to Cart vs Notify Me)
   Delivery date calculation depends on pincode/address
   Changes with Prime membership status
```

---

## What the Interview Will Cover

```
┌────────────────────────────────────────────────────────────────┐
│                      INTERVIEW ARC                             │
│                                                                │
│  1. Requirements    →  PDP, listing, search, cart, checkout?   │
│  2. Architecture    →  Two pages: listing + PDP                │
│  3. Listing page    →  Grid, faceted filters, sort, URL sync   │
│  4. Faceted search  →  Multiple dimensions, debounce, pills    │
│  5. PDP layout      →  Two-column: gallery + purchase panel    │
│  6. Variant select  →  THE centrepiece — SKU lookup,           │
│                         unavailable states, image change        │
│  7. Image zoom      →  mousemove + CSS background-position     │
│  8. Reviews         →  Star breakdown, filter by star rating   │
│  9. Cart flow       →  Add to Cart vs Buy Now, stock check     │
│  10. Performance    →  Image optimisation, skeleton loading    │
│  11. Edge cases     →  Out of stock, price change, deleted     │
│  12. Summary                                                   │
└────────────────────────────────────────────────────────────────┘
```

---

## Full System Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                         USER'S BROWSER                           │
│                                                                  │
│  Route: /search?q=iphone+15                                      │
│    GET /api/search?q=iphone+15&filters=...  → ProductListing     │
│                                                                  │
│  Route: /product/:productId                                       │
│    GET /api/products/:id           → Product metadata            │
│    GET /api/products/:id/reviews   → Reviews (lazy, below fold)  │
│    GET /api/recommendations?p=:id  → "Also viewed" (lazy)        │
└────────────────┬─────────────────────────────────────────────────┘
                 │
    ┌────────────▼───────────────────────────────────────┐
    │                  AMAZON BACKEND                    │
    │  - Product catalogue   (metadata, SKUs, images)    │
    │  - Search & ranking    (Elasticsearch)             │
    │  - Reviews service     (aggregates, distribution)  │
    │  - Inventory service   (stock counts, SKU data)    │
    │  - Pricing engine      (deals, coupons, EMI)       │
    │  - Delivery estimation (address + warehouse data)  │
    └────────────────────────────────────────────────────┘
```

---

## Component Hierarchy — Product Detail Page

```
<ProductDetailPage productId={id}>
│
├── <Breadcrumb>                     Electronics > Phones > Apple
│
├── <PDPLayout>                      two-column grid
│     │
│     ├── <ProductGallery>           LEFT column
│     │     ├── <MainImage>          large current image + zoom trigger
│     │     ├── <ZoomPanel>          appears on hover (CSS bg trick)
│     │     └── <ThumbnailStrip>     horizontal row of image thumbnails
│     │
│     └── <PurchasePanel>            RIGHT column
│           ├── <ProductTitle>
│           ├── <RatingSummary>      stars + count, links to reviews
│           ├── <PriceSection>
│           │     ├── DealPrice      bold, large
│           │     ├── OriginalPrice  strikethrough
│           │     └── SavingsLabel   "13% off  Save ₹20,000"
│           ├── <VariantSelector>    ← most complex component
│           │     └── <VariantGroup> × N  (Color, Storage)
│           │           └── <VariantOption> × N
│           ├── <StockStatus>        "In Stock" / "Only 3 left" / "Out of Stock"
│           ├── <DeliveryInfo>       Prime badge + estimated date
│           ├── <AddToCartButton>
│           └── <BuyNowButton>
│
├── <ProductDescription>             expandable, below the fold
│
├── <ReviewsSection>                 lazy loaded
│     ├── <RatingBreakdown>          star distribution chart
│     ├── <ReviewFilters>            filter by star, verified only
│     └── <ReviewList>
│           └── <ReviewCard> × N
│
└── <RecommendationsRow>             "Customers also viewed"
```

---

## Variant & SKU Data Model — The Core

```javascript
// Product has variants (the options) and SKUs (the combinations)

{
  productId: "B0CHX3SZDX",
  title: "Apple iPhone 15 Pro",
  variants: {
    color:   [
      { label: "Black Titanium",   value: "black",  swatch: "#2c2c2c" },
      { label: "White Titanium",   value: "white",  swatch: "#f5f5f0" },
      { label: "Natural Titanium", value: "natural", swatch: "#ccc0b0" }
    ],
    storage: [
      { label: "128GB",  value: "128gb"  },
      { label: "256GB",  value: "256gb"  },
      { label: "512GB",  value: "512gb"  },
      { label: "1TB",    value: "1tb"    }
    ]
  },
  skus: [
    {
      combination: { color: "black", storage: "128gb" },
      price: 134900,
      originalPrice: 149900,
      stock: 12,
      images: ["black_128_1.jpg", "black_128_2.jpg"]
    },
    {
      combination: { color: "black", storage: "1tb" },
      price: 199900,
      originalPrice: 219900,
      stock: 0          // ← out of stock
    },
    {
      combination: { color: "white", storage: "128gb" },
      // ... no entry → combination doesn't exist
    }
    // ...
  ]
}
```

---

## Variant Selection State Machine

```
User lands on PDP:
  Default selection = first available SKU
  e.g. { color: "black", storage: "128gb" }

User selects Color: White + Storage: 1TB:
  Check if SKU exists for { color: "white", storage: "1tb" }
  → No SKU → show option as greyed out / disabled

User selects Color: Black + Storage: 1TB:
  SKU exists but stock: 0
  → Option shown but marked "Out of Stock"
  → Add to Cart → "Notify me" instead

Selected combination changes:
  → price updates
  → originalPrice updates
  → stock status updates
  → product images swap to that variant's images
```

---

## Image Zoom — Technical Mechanism

```
No library needed — pure CSS background-position trick

Main image:                  Zoom panel (right of main):
┌────────────────────────┐   ┌────────────────────────┐
│                        │   │   [magnified portion]   │
│   📷 Product image     │   │   same image, 3× size   │
│   (user hovers here)   │   │   bg-position follows   │
│   cursor shows loupe   │   │   mouse coordinates     │
└────────────────────────┘   └────────────────────────┘

Math:
  Mouse at (x=80%, y=30%) within image

  Zoom panel shows:
  background-image: url(image.jpg)
  background-size: 300%   (3× zoom)
  background-position: 80% 30%

The zoom panel background moves to keep
the area under the cursor centred in the panel.
```

---

## Faceted Filter Architecture

```
Active filters drive the API query:

User applies:
  Brand:     Apple, Samsung
  Price:     ₹30,000 – ₹1,50,000
  Rating:    4+ stars
  Delivery:  Prime

URL becomes:
  /search?q=smartphones&brand=apple,samsung&price_min=30000&price_max=150000
           &rating=4&prime=true&sort=relevance

API call:
  GET /api/search?q=smartphones&brand=apple,samsung&price_min=30000
                 &price_max=150000&rating=4&prime=true

Active filter pills:
  [Apple ×] [Samsung ×] [₹30K–₹1.5L ×] [4+ Stars ×] [Prime ×]
  [Clear all filters]
```

---

## Star Rating Breakdown

```
4.6 ★ overall (2,847 ratings)

5 ★  ██████████████████████████████ 67%  (1,908)  ← clickable to filter
4 ★  ████████████                   21%  (598)
3 ★  ████                           6%   (171)
2 ★  ██                             3%   (85)
1 ★  ██                             3%   (85)

Clicking "5 ★" adds filter: reviews?rating=5
Reviews list then only shows 5-star reviews.
```

---

## Data Structures

```javascript
// Search result item (listing page)
{
  productId: "B0CHX3SZDX",
  title: "Apple iPhone 15 Pro (128 GB) - Black Titanium",
  thumbnail: "https://...",
  rating: 4.6,
  reviewCount: 2847,
  price: 134900,
  originalPrice: 149900,
  discount: 10,
  isPrime: true,
  deliveryLabel: "Get it by Tomorrow",
  badge: "Best Seller",    // "Best Seller" | "Amazon's Choice" | null
  stockStatus: "in_stock"  // "in_stock" | "low_stock" | "out_of_stock"
}

// Review
{
  id: "rev_abc",
  authorName: "Verified Purchase",
  rating: 5,
  title: "Absolutely worth the price",
  body: "Camera is outstanding, especially the night mode...",
  helpfulCount: 234,
  verifiedPurchase: true,
  createdAt: "2024-01-10T10:00:00Z",
  images: []  // user-uploaded review images
}
```

---

## What You Will Learn From This Interview

| Concept | Why It Matters |
|---------|----------------|
| SKU lookup from variant combination | O(1) lookup via Map, not O(n) array search |
| Unavailable variant UX | Grey out + diagonal strikethrough line |
| Image swap on variant change | Images tied to SKU, not product |
| Image zoom via CSS background-position | No library needed, pure CSS/JS |
| Faceted search (AND logic) | All active filters combine to one query |
| URL-encoded filter state | Shareable, bookmarkable, back button works |
| Price range slider debounce | Don't refetch on every pixel drag |
| Active filter pills | Visual summary + one-click removal |
| Star rating breakdown bar chart | Click to filter reviews by star rating |
| Add to Cart vs Buy Now flow | Different paths, different state requirements |
| Skeleton loading for PDP | Images + price + reviews all load at different times |
| "Only N left" urgency | Stock count affects CTA rendering |

---

## Interview Evaluation Criteria

```
Level         What They Want to See
────────────────────────────────────────────────────────────────
Junior    →   Basic PDP layout. Knows about variants.
              Can display product images and price.
Mid-level →   Variant selection with stock awareness.
              Faceted filters + URL sync.
              Lazy load reviews below fold.
Senior    →   SKU lookup via Map (not linear search).
              Image zoom via CSS background-position.
              Price range slider with debounce.
              Unavailable variant states (greyed out vs out of stock).
              Cart optimistic update with stock validation.
Staff     →   A/B testing CTA placement.
              Dynamic pricing (price changes while user is on page).
              Inventory reservation on Add to Cart.
              International price/currency/tax handling.
```
