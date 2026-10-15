# Cordova Eats: simple entity relationship diagram

This is a compact view of the main application data. It follows the declared
foreign keys in PostgreSQL migrations `001`–`016`. The [complete ERD](ERD_FULL.md)
shows all 32 application tables and 46 foreign-key relationships.

```mermaid
erDiagram
    USERS ||--o| USER_PREFERENCES : user_id
    USERS ||--o{ RESTAURANTS : owner_id
    USERS ||--o{ REVIEWS : user_id
    USERS ||--o{ FAVORITES : user_id
    USERS ||--o{ ORDERS : user_id
    USERS ||--o{ RECOMMENDATION_FEEDBACK : user_id
    USERS ||--o{ BUSINESS_CLAIMS : applicant_id

    RESTAURANTS ||--o{ RESTAURANT_CUISINES : restaurant_id
    CUISINES ||--o{ RESTAURANT_CUISINES : cuisine_id
    RESTAURANTS ||--o{ MENU_CATEGORIES : restaurant_id
    RESTAURANTS ||--o{ MENU_ITEMS : restaurant_id
    MENU_CATEGORIES o|--o{ MENU_ITEMS : category_id
    RESTAURANTS ||--o{ REVIEWS : restaurant_id
    RESTAURANTS ||--o{ FAVORITES : restaurant_id
    RESTAURANTS ||--o{ ORDERS : restaurant_id
    RESTAURANTS ||--o{ RECOMMENDATION_FEEDBACK : restaurant_id
    RESTAURANTS ||--o{ BUSINESS_CLAIMS : restaurant_id
    RESTAURANTS ||--o{ PROMOTIONS : restaurant_id

    USERS {
        uuid id PK
        string email UK
        string full_name
        user_role role
    }
    USER_PREFERENCES {
        uuid id PK
        uuid user_id FK, UK
        text_array preferred_cuisines
        price_range budget_range
    }
    RESTAURANTS {
        uuid id PK
        uuid owner_id FK
        string name
        string slug UK
        business_status status
    }
    CUISINES {
        int id PK
        string name UK
    }
    RESTAURANT_CUISINES {
        uuid restaurant_id PK, FK
        int cuisine_id PK, FK
    }
    MENU_CATEGORIES {
        uuid id PK
        uuid restaurant_id FK
        string name
    }
    MENU_ITEMS {
        uuid id PK
        uuid restaurant_id FK
        uuid category_id FK
        string name
        numeric price
    }
    REVIEWS {
        uuid id PK
        uuid user_id FK
        uuid restaurant_id FK
        int rating
        review_status status
    }
    FAVORITES {
        uuid user_id PK, FK
        uuid restaurant_id PK, FK
    }
    ORDERS {
        uuid id PK
        uuid user_id FK
        uuid restaurant_id FK
        numeric total_amount
        string status
    }
    RECOMMENDATION_FEEDBACK {
        uuid id PK
        uuid user_id FK
        uuid restaurant_id FK
        int sentiment
    }
    BUSINESS_CLAIMS {
        uuid id PK
        uuid applicant_id FK
        uuid restaurant_id FK
        string status
    }
    PROMOTIONS {
        uuid id PK
        uuid restaurant_id FK
        string title
        promotion_status status
    }
```

`||` means one required parent, `o|` means an optional related row, and `o{`
means zero or more rows. `PK` is a primary key, `FK` is a declared foreign key,
and `UK` is unique. Each relationship label names the child table's FK.

The join tables `restaurant_cuisines` and `favorites` represent many-to-many
relationships. A user can write only one review per restaurant, enforced by
`UNIQUE (restaurant_id, user_id)`. A menu item can have no category because
`menu_items.category_id` is nullable. This overview omits supporting tables
for authentication, photos, operating hours, subscriptions, analytics,
notifications, moderation, and claim documents; they appear in the complete
diagram.
