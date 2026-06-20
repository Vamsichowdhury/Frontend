# Amazon E-Commerce UI — Full Interview Transcript

**Role:** Frontend Engineer (3–5 years experience)
**Duration:** ~55 minutes
**Interviewer style:** Will push hardest on the variant selection — it's more complex than it looks. Will also probe the image zoom implementation and the faceted filter URL state. Expects product-aware thinking, not just technical answers.

---

> **How to use this file:**
> The variant selection discussion (Phase 6) is the dramatic centre of this interview. The SKU lookup pattern — building a Map for O(1) combination lookup rather than searching an array — is the insight that separates strong candidates. The image zoom (Phase 7) is the second most technically specific section. Pay attention to the "unavailable variant" states — there are two distinct cases (combination doesn't exist vs combination exists but out of stock) that most candidates conflate.

---

## ─────────────────────────────────────
## PHASE 1 — Opening & Requirements
## ─────────────────────────────────────

---

**Interviewer:**

Design the Amazon e-commerce frontend. Go ahead.

---

**Candidate:**

Amazon has a large number of pages. Let me ask a few questions to make sure I'm building the right thing.

---

**Interviewer:**

Go ahead.

---

**Candidate:**

> #### Why scope Amazon carefully
> Amazon's frontend spans dozens of distinct experiences: product listing, PDP, cart, checkout, order tracking, seller central, Prime Video, Kindle, Alexa, and more. Each is a distinct engineering problem. The PDP (Product Detail Page) is the most technically rich — variant selection, image gallery, reviews — and the most commonly asked in interviews. Naming it by its industry term ("PDP") also signals product familiarity.

---

**Q1. Are we focusing on the Product Detail Page, the listing/search page, or both? What about cart and checkout?**

> **Why ask this:**
> The PDP and the listing page are two very different design problems:
> - PDP: variant selection, image gallery, reviews, stock status, Add to Cart — all about converting a single product
> - Listing page: grid of products, faceted filters, sort, pagination — about discovery
>
> Cart and checkout are yet another problem. The cart alone can be a 30-minute discussion (see shopping-cart question). Checkout is a multi-step form with address, payment, confirmation — another 30 minutes.
>
> Asking this signals you know each page is distinct and time-bound. Most interviewers will say "PDP is the priority, listing page as well if time."

---

**Q2. Do products have variants — like size, colour, storage?**

> **Why ask this:**
> Variants are the most technically interesting part of the PDP. Without variants, the PDP is a straightforward data display. With variants, you need a SKU lookup system where the combination of selected options (Color: Blue + Storage: 256GB) maps to a specific product configuration with its own price, stock count, and images.
>
> Asking this upfront signals you understand variant selection is non-trivial and worth dedicated discussion.

---

**Q3. Should the product listing have faceted search — multiple filters that combine?**

> **Why ask this:**
> A simple category dropdown is trivial. Faceted search — Brand + Price range + Rating + Prime + Delivery speed all combining simultaneously — requires a proper filter state model, URL synchronisation, and debouncing for range sliders.
>
> "Faceted" is a specific term from information retrieval. Using it signals you've thought about search UX at a product level.

---

**Q4. Do we need the image gallery with zoom? Is that in scope?**

> **Why ask this:**
> The hover-to-zoom feature on Amazon's product images is a distinctive, non-trivial UI interaction. Without asking, you might skip it. Asking signals you know it's a real engineering problem — not just an `<img>` tag — and you're prepared to discuss the mousemove + CSS background-position technique.

---

**Q5. Reviews — should they include the star breakdown chart?**

> **Why ask this:**
> Basic reviews (a list of review cards) are simple. The star breakdown chart — showing what percentage of reviews are 5-star, 4-star, etc., with clickable bars to filter — is a more complex, specifically Amazon-like feature. Asking separates the minimum viable reviews section from the full Amazon experience.

---

**Interviewer:**

Good. Here's the scope:

- Both the PDP and the listing/search page.
- Yes, products have variants — colour and storage for a smartphone.
- Yes, faceted filters on the listing page.
- Yes, image gallery with zoom on the PDP.
- Yes, reviews with the star breakdown chart.
- Cart as a reference — treat Add to Cart as a button that calls an API.

---

**Candidate:**

Perfect. Two pages, with variants and image zoom as the technically interesting parts. Let me start with the listing page and then go deep on the PDP.

---

## ─────────────────────────────────────
## PHASE 2 — Listing Page Architecture
## ─────────────────────────────────────

---

**Interviewer:**

Walk me through the listing page.

---

**Candidate:**

The listing page has a two-column layout — filters sidebar on the left, product grid on the right:

```
┌──────────────────────────────────────────────────────────┐
│  Showing 1–24 of 1,247 results for "iphone 15"           │
│                                                          │
│  Sort by: [Relevance ▾]                                 │
├──────────────┬───────────────────────────────────────────┤
│  FILTERS     │  PRODUCT GRID                            │
│              │                                          │
│  Brand       │  ┌────┐ ┌────┐ ┌────┐ ┌────┐            │
│  ☑ Apple     │  │    │ │    │ │    │ │    │            │
│  ☐ Samsung   │  │ 🎁 │ │ 🎁 │ │ 🎁 │ │ 🎁 │            │
│  ☐ OnePlus   │  └────┘ └────┘ └────┘ └────┘            │
│              │  Product  Product  Product  Product      │
│  Price Range │  ★★★★☆  ★★★★☆  ★★★★☆  ★★★☆☆           │
│  ₹0────₹2L   │  ₹1.3L   ₹45K    ₹25K    ₹18K          │
│              │                                          │
│  Customer    │  ...24 products per page, infinite or   │
│  Rating      │  paginated (discuss with interviewer)   │
│  ★★★★☆ & up  │                                          │
│  ★★★☆☆ & up  │                                          │
│              │                                          │
│  [⚡ Prime]  │                                          │
└──────────────┴───────────────────────────────────────────┘
```

State and data loading:

```javascript
function ListingPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read filters from URL on mount
  const [filters, setFilters] = useState({
    brands:   searchParams.getAll("brand"),
    priceMin: Number(searchParams.get("price_min")) || 0,
    priceMax: Number(searchParams.get("price_max")) || 200000,
    minRating: Number(searchParams.get("rating")) || 0,
    prime:    searchParams.get("prime") === "true",
    sortBy:   searchParams.get("sort") || "relevance"
  });

  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // Refetch whenever filters change
  useEffect(() => {
    setLoading(true);
    fetchProducts(filters).then(data => {
      setProducts(data.products);
      setTotalCount(data.total);
      setLoading(false);
    });
    // Sync filters to URL
    syncFiltersToURL(filters, setSearchParams);
  }, [filters]);
}
```

---

## ─────────────────────────────────────
## PHASE 3 — Faceted Filters
## ─────────────────────────────────────

---

**Interviewer:**

Walk me through the faceted filter system. The user selects Apple AND 4+ stars AND Prime AND price ₹50k–₹1.5L. How does that work?

---

**Candidate:**

All active filters combine with AND logic — narrowing the result set. Each filter dimension is independent but they all feed into a single API call.

**Filter state to URL sync:**

```javascript
const syncFiltersToURL = (filters, setSearchParams) => {
  const params = new URLSearchParams();

  filters.brands.forEach(b => params.append("brand", b));
  if (filters.priceMin > 0)  params.set("price_min", filters.priceMin);
  if (filters.priceMax < 200000) params.set("price_max", filters.priceMax);
  if (filters.minRating > 0) params.set("rating", filters.minRating);
  if (filters.prime)         params.set("prime", "true");
  if (filters.sortBy !== "relevance") params.set("sort", filters.sortBy);

  setSearchParams(params, { replace: true }); // replace not push — no history bloat
};
```

**Price range slider — debounce is critical:**

The slider fires `onChange` on every pixel dragged. Without debounce, dragging from ₹0 to ₹1.5L fires 200+ events, each triggering an API call.

```javascript
const [priceRange, setPriceRange] = useState([filters.priceMin, filters.priceMax]);
const debouncedPriceRange = useDebounce(priceRange, 500); // 500ms after drag stops

// Only update filters (triggers API) when user stops dragging
useEffect(() => {
  setFilters(prev => ({
    ...prev,
    priceMin: debouncedPriceRange[0],
    priceMax: debouncedPriceRange[1]
  }));
}, [debouncedPriceRange]);

// But the slider thumb moves in real time (priceRange state, not debouncedPriceRange)
<PriceSlider
  value={priceRange}
  onChange={setPriceRange}  // instant visual response
/>
<span>₹{priceRange[0].toLocaleString()} – ₹{priceRange[1].toLocaleString()}</span>
```

**Active filter pills:**

```jsx
<div className="active-filters">
  {filters.brands.map(b => (
    <FilterPill
      key={b}
      label={b}
      onRemove={() => setFilters(prev => ({
        ...prev,
        brands: prev.brands.filter(brand => brand !== b)
      }))}
    />
  ))}
  {filters.minRating > 0 && (
    <FilterPill
      label={`${filters.minRating}+ Stars`}
      onRemove={() => setFilters(prev => ({ ...prev, minRating: 0 }))}
    />
  )}
  {filters.prime && (
    <FilterPill label="Prime" onRemove={() => setFilters(prev => ({ ...prev, prime: false }))} />
  )}
  {(filters.priceMin > 0 || filters.priceMax < 200000) && (
    <FilterPill
      label={`₹${(filters.priceMin/1000).toFixed(0)}K – ₹${(filters.priceMax/1000).toFixed(0)}K`}
      onRemove={() => setFilters(prev => ({ ...prev, priceMin: 0, priceMax: 200000 }))}
    />
  )}
  <button onClick={() => setFilters(defaultFilters)}>Clear all</button>
</div>
```

---

**Interviewer:**

What happens to the filter sidebar options when a filter is active? For example, user selects Brand: Apple. Should Samsung still show in the Brand filter list?

---

**Candidate:**

Yes — and this is an important product detail. Hiding Samsung would confuse the user ("where did Samsung go?"). The standard behaviour is to keep all options visible but show updated counts next to each:

```
Brand
  ✓ Apple   (1,247)  ← currently selected
  ○ Samsung   (342)  ← still visible, different count
  ○ OnePlus   (128)
```

The counts update to reflect how many results WOULD show if that option were added to the current filter set. This is the "faceted count" pattern used by all major e-commerce platforms.

Implementing exact faceted counts requires the API to return them per filter option. The API response includes not just the product list but also the facet counts:

```javascript
{
  products: [...],
  total: 1247,
  facets: {
    brands:  [{ value: "apple", count: 1247 }, { value: "samsung", count: 342 }],
    ratings: [{ value: 4, count: 980 }, { value: 3, count: 267 }]
  }
}
```

---

## ─────────────────────────────────────
## PHASE 4 — PDP Layout
## ─────────────────────────────────────

---

**Interviewer:**

Walk me through the Product Detail Page layout and data loading.

---

**Candidate:**

The PDP has a two-column layout on desktop:

```css
.pdp-layout {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 24px;
  align-items: start;    /* don't stretch right column to match left height */
}

@media (max-width: 900px) {
  .pdp-layout { grid-template-columns: 1fr; }
}
```

Data loading on mount:

```javascript
function ProductDetailPage({ productId }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Primary data — product needs to load before anything is useful
    fetch(`/api/products/${productId}`)
      .then(r => r.json())
      .then(data => {
        setProduct(data);
        setLoading(false);
        // Set default selected variant to first available SKU
        const defaultSku = findFirstAvailableSku(data.skus);
        setSelectedVariants(defaultSku?.combination || {});
      });
    // Reviews are below the fold — lazy loaded via IntersectionObserver
    // Recommendations row is below the fold — same approach
  }, [productId]);
}
```

The right column (purchase panel) needs the product data first before it's useful — so it's not parallelised.

However, once the product loads, I can fire the reviews and recommendations fetches in parallel:

```javascript
// After product loads, fire lazy fetches
// (but these are actually handled by their own components
// with IntersectionObserver — they self-trigger when visible)
```

---

## ─────────────────────────────────────
## PHASE 5 — Variant Selection Setup
## ─────────────────────────────────────

---

**Interviewer:**

The product has Colour (Black, White, Natural) and Storage (128GB, 256GB, 512GB, 1TB). Walk me through variant selection.

---

**Candidate:**

First, let me explain the data model because it drives the implementation.

A product has **variant options** (the labels shown in the UI) and **SKUs** (the actual orderable products for each combination):

```javascript
variants: {
  color:   [{ label: "Black", value: "black" }, { label: "White", value: "white" }, ...],
  storage: [{ label: "128GB", value: "128gb" }, ...]
}

skus: [
  { combination: { color: "black", storage: "128gb" }, price: 134900, stock: 12, images: [...] },
  { combination: { color: "black", storage: "256gb" }, price: 154900, stock: 5,  images: [...] },
  { combination: { color: "black", storage: "1tb"   }, price: 199900, stock: 0  }, // out of stock
  // No entry for { color: "white", storage: "1tb" } — doesn't exist
]
```

For the user, I maintain their current selection:

```javascript
const [selectedVariants, setSelectedVariants] = useState({
  color:   "black",   // default: first available
  storage: "128gb"
});
```

When variants change, I look up the matching SKU:

```javascript
const currentSku = useMemo(() => {
  return skus.find(sku =>
    Object.entries(selectedVariants).every(
      ([key, value]) => sku.combination[key] === value
    )
  );
}, [skus, selectedVariants]);
```

---

**Interviewer:**

Finding the SKU with `Array.find` works, but what if there are 500 SKUs — is there a faster approach?

---

**Candidate:**

Good catch. With `Array.find` every variant selection requires O(n) search through all SKUs. For most products (50 SKUs max) it's fine. For complex products with many dimensions, it matters.

Better: build a Map on mount with a composite key:

```javascript
// Build on mount, once
const skuMap = useMemo(() => {
  const map = new Map();
  skus.forEach(sku => {
    // Create a deterministic key from the combination
    // Sort keys alphabetically so { color, storage } and { storage, color } produce the same key
    const key = Object.entries(sku.combination)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}:${v}`)
      .join("|");
    map.set(key, sku);
  });
  return map;
}, [skus]);

// O(1) lookup on every variant change
const lookupSku = (variants) => {
  const key = Object.entries(variants)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}:${v}`)
    .join("|");
  return skuMap.get(key);  // O(1)
};

// "color:black|storage:256gb" → SKU object
const currentSku = useMemo(
  () => lookupSku(selectedVariants),
  [skuMap, selectedVariants]
);
```

---

**Interviewer:**

The user selects Black colour and then tries to select 1TB storage. The SKU exists but it's out of stock. What does the UI show?

---

**Candidate:**

There are two distinct unavailable states that look different:

```
State 1 — Combination doesn't exist in the catalogue:
  e.g. White + 1TB — Apple simply doesn't make this
  Option rendering:
    [1TB]   ← greyed out text, diagonal strikethrough line on the box
  Cursor: not-allowed
  Tooltip on hover: "This combination is not available"
  Clicking: no-op (prevent selection)

State 2 — Combination exists but out of stock:
  e.g. Black + 1TB — Apple makes it, currently sold out
  Option rendering:
    [1TB]   ← greyed out but without the strikethrough
  Cursor: pointer (user can still select it)
  Clicking: SELECT it, but show:
    - "Currently unavailable" below the price
    - Add to Cart button changes to "Notify me when available"
```

Why different? Because "doesn't exist" means the user made an impossible selection. "Out of stock" means the product exists and they should be able to sign up for restock notifications.

```javascript
const getOptionState = (variantKey, value) => {
  const testCombination = { ...selectedVariants, [variantKey]: value };
  const matchingSku = lookupSku(testCombination);

  if (!matchingSku) return "unavailable";     // no SKU — doesn't exist
  if (matchingSku.stock === 0) return "out_of_stock"; // exists but empty
  return "available";
};

// In VariantOption:
const state = getOptionState(variantKey, option.value);

<button
  className={`variant-option ${state}`}
  onClick={state !== "unavailable" ? () => selectVariant(variantKey, option.value) : undefined}
  disabled={state === "unavailable"}
  title={state === "unavailable" ? "Not available in this combination" : undefined}
>
  {option.label}
  {state === "unavailable" && <DiagonalLine />}
</button>
```

---

**Interviewer:**

When the user selects a new colour — Black to Natural — what else changes on the page?

---

**Candidate:**

Several things update simultaneously from the new SKU:

```javascript
useEffect(() => {
  if (!currentSku) return;

  // 1. Price updates
  setCurrentPrice(currentSku.price);
  setOriginalPrice(currentSku.originalPrice);

  // 2. Images swap to this variant's images
  setGalleryImages(currentSku.images);
  setActiveImageIndex(0);  // reset to first image of new variant

  // 3. Stock status updates
  setStockStatus(
    currentSku.stock === 0 ? "out_of_stock"
    : currentSku.stock <= 3 ? "low_stock"
    : "in_stock"
  );

  // 4. CTA changes
  setCtaMode(currentSku.stock === 0 ? "notify" : "add_to_cart");

}, [currentSku]);
```

The price change in particular should be smooth — a subtle CSS transition makes it feel polished rather than jarring:

```css
.price-display {
  transition: opacity 0.15s ease;
}
.price-display.updating {
  opacity: 0.4;
}
```

---

## ─────────────────────────────────────
## PHASE 6 — Image Gallery with Zoom
## ─────────────────────────────────────

---

**Interviewer:**

Walk me through the image gallery. And specifically the zoom feature.

---

**Candidate:**

The gallery has three parts: a thumbnail strip, a main image, and a zoom panel.

```
┌──────────────────────────┐   ┌──────────────────────────┐
│                          │   │                          │
│     MAIN IMAGE           │   │     ZOOM PANEL           │
│   (user hovers here)     │   │   (shows magnified area) │
│                          │   │                          │
│   cursor: crosshair      │   │   appears on hover       │
│                          │   │   3× magnification       │
└──────────────────────────┘   └──────────────────────────┘

┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐
│ t1 │ │ t2 │ │ t3 │ │ t4 │ │ t5 │  ← thumbnail strip
└────┘ └────┘ └────┘ └────┘ └────┘
```

**Thumbnail selection:**

```javascript
const [activeIndex, setActiveIndex] = useState(0);
const [isZooming, setIsZooming] = useState(false);
const [zoomPos, setZoomPos]     = useState({ x: 0, y: 0 });
const mainImageRef = useRef(null);
```

**The zoom mechanism — no library needed:**

The zoom panel displays the same image at 3× size. CSS `background-size: 300%` makes the image 3× larger. The trick is setting `background-position` to follow the mouse cursor:

```javascript
const handleMouseMove = (e) => {
  const rect = mainImageRef.current.getBoundingClientRect();
  // Calculate cursor position as percentage within the image
  const x = ((e.clientX - rect.left) / rect.width)  * 100;
  const y = ((e.clientY - rect.top)  / rect.height) * 100;
  setZoomPos({ x, y });
};

const handleMouseEnter = () => setIsZooming(true);
const handleMouseLeave = () => setIsZooming(false);
```

The zoom panel:

```jsx
<div
  className="zoom-panel"
  style={{
    display: isZooming ? "block" : "none",
    backgroundImage: `url(${galleryImages[activeIndex]})`,
    backgroundSize:     "300%",   // 3× the image size
    backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
    backgroundRepeat:   "no-repeat",
    width:  "100%",
    height: "400px"
  }}
/>
```

When the cursor is at 30% from left, 50% from top, `background-position: 30% 50%` positions the background so the area under the cursor is centred in the zoom panel.

```
Cursor at (30%, 50%):
  background-position: 30% 50%
  → the zoom panel shows the area around the 30%/50% point of the image
  → zoomed 3× — user sees fine detail

Cursor at (80%, 20%) (near top-right):
  background-position: 80% 20%
  → zoom panel shifts to show top-right area
```

The math is elegant: the percentage cursor position within the image is directly usable as the CSS `background-position` value.

---

**Interviewer:**

What's the difference between showing the zoom panel next to the image (Amazon's desktop behaviour) vs a magnifying lens overlay on the image itself?

---

**Candidate:**

Two patterns, both common:

```
Pattern 1 — Side panel (Amazon desktop):
  Zoom panel appears beside the main image
  Main image is NOT obscured
  User sees both the full image and the zoomed area simultaneously
  Better for comparing overall shape with zoomed detail

Pattern 2 — Lens overlay (Flipkart, many mobile sites):
  A circular or rectangular "lens" sits on top of the main image
  The lens itself shows the zoomed version
  Main image is partially obscured by the lens
  More space-efficient (no need for the side panel area)
```

For the lens overlay:

```javascript
// The lens is a div positioned absolutely over the image
// background-image is the same as the main image but larger
<div
  className="zoom-lens"
  style={{
    position: "absolute",
    left: `${cursorX - LENS_SIZE/2}px`,
    top:  `${cursorY - LENS_SIZE/2}px`,
    width:  `${LENS_SIZE}px`,
    height: `${LENS_SIZE}px`,
    backgroundImage: `url(${currentImage})`,
    backgroundSize: `${mainWidth * zoomLevel}px ${mainHeight * zoomLevel}px`,
    backgroundPositionX: `-${(cursorX * zoomLevel) - LENS_SIZE/2}px`,
    backgroundPositionY: `-${(cursorY * zoomLevel) - LENS_SIZE/2}px`,
  }}
/>
```

Amazon uses the side panel on desktop because they have the horizontal space. Mobile uses tap-to-fullscreen instead — zoom interactions don't work well on touch.

---

**Interviewer:**

User selects a different colour. The main image changes to the new variant's images. Should there be a transition?

---

**Candidate:**

Yes — a brief fade keeps the swap from feeling abrupt:

```javascript
const [imageTransitioning, setImageTransitioning] = useState(false);

const handleVariantChange = (key, value) => {
  setImageTransitioning(true);
  setSelectedVariants(prev => ({ ...prev, [key]: value }));
  setTimeout(() => setImageTransitioning(false), 200);
};
```

```css
.main-image {
  transition: opacity 0.2s ease;
}
.main-image.transitioning {
  opacity: 0.3;
}
```

Also: when variant changes, the zoom state should reset. If the user was zooming on the Black phone and switches to Natural, the zoom panel should disappear until they hover on the new image:

```javascript
useEffect(() => {
  setIsZooming(false);
  setActiveIndex(0);
}, [selectedVariants]);
```

---

## ─────────────────────────────────────
## PHASE 7 — Reviews Section
## ─────────────────────────────────────

---

**Interviewer:**

Walk me through the reviews section — specifically the star breakdown chart.

---

**Candidate:**

The reviews section is below the fold — lazy loaded with IntersectionObserver, same as YouTube's comments.

The star breakdown chart is the most visually distinctive part:

```
4.6 ★  overall
────────────────────────────
5 ★  [██████████████████████████] 67%   1,908
4 ★  [████████████             ] 21%     598
3 ★  [████                     ]  6%     171
2 ★  [██                       ]  3%      85
1 ★  [██                       ]  3%      85
```

Each bar is clickable to filter reviews:

```jsx
function RatingBreakdown({ distribution, onFilterByRating, activeRatingFilter }) {
  const total = distribution.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="rating-breakdown">
      {[5, 4, 3, 2, 1].map(stars => {
        const entry = distribution.find(d => d.stars === stars) || { count: 0 };
        const pct   = total > 0 ? Math.round((entry.count / total) * 100) : 0;
        const isActive = activeRatingFilter === stars;

        return (
          <button
            key={stars}
            className={`rating-row ${isActive ? "active" : ""}`}
            onClick={() => onFilterByRating(isActive ? null : stars)}
            // Clicking active filter → deselect (show all)
          >
            <span className="stars-label">{stars} ★</span>
            <div className="bar-track">
              <div className="bar-fill" style={{ width: `${pct}%` }} />
            </div>
            <span className="pct-label">{pct}%</span>
          </button>
        );
      })}
    </div>
  );
}
```

When a star bar is clicked, `activeRatingFilter` changes and triggers a new reviews fetch:

```javascript
const [activeRatingFilter, setActiveRatingFilter] = useState(null);
const [reviews, setReviews] = useState([]);

useEffect(() => {
  const url = activeRatingFilter
    ? `/api/products/${productId}/reviews?rating=${activeRatingFilter}&limit=10`
    : `/api/products/${productId}/reviews?limit=10`;
  fetch(url).then(r => r.json()).then(data => setReviews(data.reviews));
}, [activeRatingFilter]);
```

---

**Interviewer:**

A review has 234 "Helpful" votes. User clicks "Helpful." What happens?

---

**Candidate:**

Optimistic update — same pattern as YouTube like:

```javascript
function ReviewCard({ review }) {
  const [helpfulCount, setHelpfulCount] = useState(review.helpfulCount);
  const [hasVoted, setHasVoted]         = useState(false);

  const handleHelpful = async () => {
    if (hasVoted) return; // prevent double voting

    // Optimistic
    setHelpfulCount(c => c + 1);
    setHasVoted(true);

    try {
      await fetch(`/api/reviews/${review.id}/helpful`, { method: "POST" });
    } catch {
      // Rollback
      setHelpfulCount(c => c - 1);
      setHasVoted(false);
    }
  };

  return (
    <div>
      {/* review content */}
      <button onClick={handleHelpful} disabled={hasVoted}>
        👍 Helpful ({helpfulCount})
      </button>
    </div>
  );
}
```

Once voted, the button is disabled — Amazon prevents voting more than once per review.

---

## ─────────────────────────────────────
## PHASE 8 — Add to Cart & Buy Now
## ─────────────────────────────────────

---

**Interviewer:**

The user clicks "Add to Cart." Walk me through the flow.

---

**Candidate:**

There are two CTAs with different flows:

```
[Add to Cart]   → add to cart, STAY on PDP
                   continue browsing, checkout later

[Buy Now]       → add to cart + NAVIGATE to checkout
                   immediate purchase intent
```

The Add to Cart flow:

```javascript
const [cartState, setCartState] = useState("idle");
// "idle" | "adding" | "added" | "failed"

const handleAddToCart = async () => {
  // Pre-flight check: is this SKU still in stock?
  if (!currentSku || currentSku.stock === 0) {
    setCtaMode("notify");
    return;
  }

  setCartState("adding");

  try {
    await fetch("/api/cart/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId,
        skuId: currentSku.id,
        quantity: selectedQuantity,
        price: currentSku.price   // send price to detect price changes at checkout
      })
    });
    setCartState("added");
    updateCartCount(prev => prev + selectedQuantity); // update navbar badge

    // Reset to idle after 3 seconds
    setTimeout(() => setCartState("idle"), 3000);
  } catch (err) {
    setCartState("failed");
  }
};
```

Button renders based on state:

```jsx
{cartState === "idle"    && <button onClick={handleAddToCart}>Add to Cart</button>}
{cartState === "adding"  && <button disabled>Adding... ⟳</button>}
{cartState === "added"   && <button disabled>✓ Added to Cart</button>}
{cartState === "failed"  && <button onClick={handleAddToCart}>Failed — Retry</button>}
```

---

**Interviewer:**

The price on the PDP is ₹1,29,900. User adds to cart. By the time they check out, the price has changed to ₹1,34,900. What happens?

---

**Candidate:**

This is a real scenario — Amazon's prices fluctuate dynamically. The cart item stores the price at time of adding, but at checkout the server re-validates against current prices.

On the checkout page:

```
Cart item: iPhone 15 Pro (Black, 256GB)
  Added price:    ₹1,29,900
  Current price:  ₹1,34,900

⚠️ Price of this item has increased since you added it.
   Current price: ₹1,34,900 (+₹5,000)
   [Continue at new price]  [Remove item]
```

The frontend responsibility here is to:
1. Accept a `currentPrice` field from the checkout API response
2. Compare it to the `addedPrice` stored in the cart item
3. Show the discrepancy banner if they differ
4. Allow the user to accept or remove

The backend is the source of truth for price at checkout — the client never trusts the PDP price for the final transaction.

---

## ─────────────────────────────────────
## PHASE 9 — Performance
## ─────────────────────────────────────

---

**Interviewer:**

The PDP has a lot of images — main gallery, thumbnails, reviews with user photos. What's your performance strategy?

---

**Candidate:**

**1. Image lazy loading**

All images below the fold use `loading="lazy"`. Above the fold (main gallery and thumbnails) use `loading="eager"` with `fetchpriority="high"` — the first product image is critical for LCP (Largest Contentful Paint):

```html
<img
  src="product_main.jpg"
  loading="eager"
  fetchpriority="high"
  alt="iPhone 15 Pro"
/>
```

**2. Correct image size via srcset**

```html
<img
  srcset="product_400.webp 400w, product_800.webp 800w, product_1200.webp 1200w"
  sizes="(max-width: 768px) 90vw, 500px"
  loading="eager"
  src="product_800.webp"
/>
```

Mobile gets 400w (much smaller file). Desktop gets 800w. Large desktop gets 1200w for zoom quality.

**3. Skeleton loading for PDP**

While the product data API is loading, show a skeleton that mirrors the layout:

```jsx
{loading ? (
  <PDPSkeleton />  // grey boxes in the shape of gallery + purchase panel
) : (
  <PDPContent product={product} />
)}
```

The skeleton prevents layout shift (CLS) when content loads.

**4. Lazy reviews and recommendations**

Reviews section: IntersectionObserver, load only when scrolled into view.
Recommendations row: same pattern — "Customers also viewed" doesn't need to load upfront.

---

## ─────────────────────────────────────
## PHASE 10 — Edge Cases
## ─────────────────────────────────────

---

**Interviewer:**

Product is out of stock entirely — every SKU has stock: 0. What does the PDP show?

---

**Candidate:**

```
Out of stock state:
  Stock status: "Currently unavailable"
  Add to Cart button: "Notify me when available"
    → clicking: POST /api/notifications/restock { productId, email }
    → success: "✓ We'll notify you when this is back in stock"

  All variant options are still selectable (user can indicate which variant they want)
  Price still shown (informational)
  Reviews still visible (product still exists, still relevant)
```

The "Notify me" submission:

```javascript
const [notifyState, setNotifyState] = useState("idle");

const handleNotifyMe = async () => {
  setNotifyState("submitting");
  await fetch("/api/notifications/restock", {
    method: "POST",
    body: JSON.stringify({ productId, skuId: currentSku?.id })
  });
  setNotifyState("subscribed");
};
```

---

**Interviewer:**

A product was listed but has been taken down — the API returns 404. What does the frontend show?

---

**Candidate:**

Handle the 404 gracefully — not a browser error page:

```javascript
useEffect(() => {
  fetch(`/api/products/${productId}`)
    .then(res => {
      if (res.status === 404) {
        setProductState("not_found");
        return;
      }
      if (!res.ok) throw new Error("Server error");
      return res.json();
    })
    .then(data => {
      if (data) setProduct(data);
    })
    .catch(() => setProductState("error"));
}, []);
```

The 404 state renders:

```
┌─────────────────────────────────────────────────┐
│  Sorry, this item is no longer available.       │
│                                                 │
│  It may have been removed, or the link may be   │
│  incorrect. Try searching for it again.         │
│                                                 │
│  [Search for similar items]                     │
│  [Go to Homepage]                               │
└─────────────────────────────────────────────────┘
```

A personalised "You might also like" row is a bonus here — Amazon shows recommendations even on error pages.

---

## ─────────────────────────────────────
## PHASE 11 — Summary
## ─────────────────────────────────────

---

**Interviewer:**

Three most technically important decisions. Go.

---

**Candidate:**

**1. SKU Map for O(1) variant lookup.**
Build a `Map<string, SKU>` on mount with a composite key (`"color:black|storage:256gb"`). Every variant selection does a constant-time lookup instead of scanning the SKU array. More importantly, this makes it cheap to check all possible options upfront — for every option in the UI, precompute its availability state once, cache it, render it correctly.

**2. Two distinct unavailable states for variant options.**
"Combination doesn't exist in catalogue" (diagonal strikethrough, click disabled) vs "combination exists but out of stock" (greyed but selectable, leads to Notify Me flow). Conflating these into one "unavailable" state would confuse users who want to be notified for restocks.

**3. Price range slider with two-tier state.**
`priceRange` (local state) updates on every pixel drag for smooth visual feedback. `debouncedPriceRange` (derived, 500ms delay) only updates when dragging stops, triggering the API call. Without this separation, dragging the slider fires hundreds of requests and the UI shows loading flickers throughout the drag.

---

**Interviewer:**

What would you add with more time?

---

**Candidate:**

1. **"Compare with similar items"** — side-by-side comparison table of selected specs. Requires a separate `CompareBar` component that persists across navigation.

2. **Coupon checkbox on PDP** — "Apply ₹500 coupon" tick box that updates the final price display. Coupons have eligibility rules that the API validates.

3. **EMI options** — "₹5,826/month for 24 months with No Cost EMI." A secondary price display below the main price. Tapping shows a breakdown modal.

4. **Pincode-based delivery estimation** — input box for delivery pincode. Changes the "Get it by Tomorrow" message. API call: `GET /api/delivery?sku=X&pincode=110001`.

5. **"Questions & Answers" section** — user-submitted Q&A below reviews. Similar structure to reviews but with a different data source and the ability to upvote helpful answers.

---

**Interviewer:**

Excellent — the variant selection and image zoom were well handled.

---

## ─────────────────────────────────────
## POST-INTERVIEW: Analysis
## ─────────────────────────────────────

```
✅  Named pages by industry terms (PDP, listing, faceted search)
✅  Price range slider: two-tier state (visual vs debounced API)
✅  Faceted count (show updated counts for unselected filter options)
✅  URL sync with replace: true (no history bloat on every filter change)
✅  SKU Map for O(1) lookup — justified over Array.find
✅  Composite key for Map ("color:black|storage:256gb") with sorted keys
✅  Two distinct unavailable variant states (doesn't exist vs out of stock)
✅  Image swap + transition on variant change
✅  Zoom resets on variant change
✅  CSS background-position trick for image zoom (no library)
✅  Side panel vs lens overlay — both patterns explained
✅  Star breakdown bars — clickable to filter reviews
✅  Price change detection at checkout (security concern)
✅  Add to Cart state machine (idle → adding → added → failed)
✅  Out of stock → "Notify me" flow with subscription
✅  fetchpriority="high" on main product image (LCP optimization)
✅  404 → graceful product unavailable page (not browser error)
```

---

## What Would Have Hurt the Score

```
❌  Array.find for SKU lookup without mentioning Map alternative
❌  Conflating "doesn't exist" and "out of stock" variant states
❌  No debounce on price range slider (hundreds of API calls on drag)
❌  URL sync without replace: true (back button goes through every filter state)
❌  Image zoom attempted with a library without explaining the CSS mechanism
❌  Not swapping images on variant change
❌  Not resetting zoom state on variant change
❌  Static star breakdown chart (not clickable to filter reviews)
❌  Forgetting price re-validation at checkout
❌  No fetchpriority on main image (slow LCP)
```

---

## The 12 Concepts This Interview Tests

| # | Concept | Question that revealed it |
|---|---------|--------------------------|
| 1 | Faceted filter state model | "Walk me through the filter system" |
| 2 | Price slider two-tier state | "Range slider — debounce?" |
| 3 | Faceted counts update | "Does Samsung still show after selecting Apple?" |
| 4 | SKU Map O(1) lookup | "500 SKUs — is Array.find fast enough?" |
| 5 | Composite Map key | "How do you build the SKU Map?" |
| 6 | Two unavailable variant states | "Black + 1TB is out of stock. What shows?" |
| 7 | Image swap on variant change | "User selects Natural colour. What changes?" |
| 8 | CSS background-position zoom | "Walk me through image zoom" |
| 9 | Side panel vs lens overlay | "What's the difference between the two zoom patterns?" |
| 10 | Star breakdown bar — filterable | "Walk me through the star breakdown chart" |
| 11 | Price change at checkout | "Price changes between Add to Cart and checkout" |
| 12 | fetchpriority for LCP | "Performance strategy for PDP images?" |
