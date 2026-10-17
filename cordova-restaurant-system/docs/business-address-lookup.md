# Business address lookup

Business registration collects a street address and optional barangay, then looks up matching buildings or streets in Cordova, Cebu. The owner reviews the Google Maps preview and confirms a location. Coordinates remain internal to the existing restaurant API and database; there are no coordinate entry fields or default business pin.

Lookup runs after a 1.5-second pause. Edits invalidate the confirmed location, pending requests are cancelled, and old responses are ignored. No-match and unavailable-provider responses block submission until a location is confirmed. Street matches are explicitly marked approximate; municipality and barangay centres are excluded.

`POST /api/restaurants/location-search` requires a signed-in customer, owner, or admin. It accepts `{ address, barangay }`, restricts results to Cordova, and limits lookups to 15 per minute per account. Provider requests time out after 10 seconds. Successful results are cached for 10 minutes in a bounded instance-local cache.

Address data comes from Photon/OpenStreetMap; the map preview comes from Google Maps. This does not require a Google Maps API key. The UI credits both sources. Photon's public instance is best-effort and permits reasonable request volumes, with no availability guarantee. For heavier use, configure `ADDRESS_LOOKUP_URL` on the backend to point to a dedicated Photon-compatible server. An address absent from OpenStreetMap may require a known nearby landmark or a more complete street name.

References: [Photon usage](https://github.com/komoot/photon), [Photon API](https://github.com/komoot/photon/blob/master/docs/api-v1.md), [OpenStreetMap attribution](https://www.openstreetmap.org/copyright).
