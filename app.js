// Plain JavaScript: fetch the JSON, select the FIRST 50, and render cards.
const container = document.querySelector('#listings');
const statusMessage = document.querySelector('#status');
const retryButton = document.querySelector('#retry');
const nightsInput = document.querySelector('#nights');
const travelersInput = document.querySelector('#travelers');
const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
let listings = [];

// Use textContent for dataset text instead of inserting untrusted HTML.
function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function plainText(value) {
  const document = new DOMParser().parseFromString(
    String(value ?? '').replace(/<br\s*\/?\s*>/gi, '\n'), 'text/html'
  );
  return document.body.textContent.trim();
}

function amenitiesList(value) {
  let items = value;
  if (typeof items === 'string') {
    try { items = JSON.parse(items); } catch { items = [items]; }
  }
  if (!Array.isArray(items)) return [];
  return items.map(item => String(item).replace(/\\u([0-9a-f]{4})/gi,
    (_, hex) => String.fromCharCode(parseInt(hex, 16))));
}

function priceNumber(value) {
  if (value === null || value === undefined || value === '') return NaN;
  return Number(String(value).replace(/[$,]/g, ''));
}

function imageWithFallback(url, alt, fallbackClass, fallbackText) {
  const fallback = element('span', fallbackClass, fallbackText);
  const image = element('img');
  image.alt = alt;
  image.loading = 'lazy';
  image.addEventListener('error', () => image.replaceWith(fallback), { once: true });
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) return fallback;
    image.src = parsed.href;
  } catch { return fallback; }
  return image;
}

function createCard(listing, index) {
  const card = element('article', 'card');
  const photo = element('div', 'photo');
  photo.append(imageWithFallback(listing.thumbnail_url || listing.picture_url,
    listing.name || 'Listing photo', 'fallback', 'Photo unavailable'));
  photo.append(element('span', 'number', String(index + 1).padStart(2, '0')));
  const content = element('div', 'content');
  content.append(element('p', 'location', listing.neighbourhood_cleansed || 'San Francisco'));
  content.append(element('h3', '', listing.name || 'Unnamed listing'));
  const host = element('div', 'host');
  const hostName = listing.host_name || 'Unknown host';
  host.append(imageWithFallback(listing.host_thumbnail_url || listing.host_picture_url,
    `Photo of ${hostName}`, 'avatar-fallback', hostName.charAt(0)));
  const hostText = element('div', '', `Hosted by ${hostName}`);
  hostText.append(element('small', '', listing.room_type || 'Room type unavailable'));
  host.append(hostText);
  content.append(host);
  const description = element('details');
  description.append(element('summary', '', 'About this stay'));
  description.append(element('p', 'description', plainText(listing.description) || 'No description provided.'));
  const amenities = amenitiesList(listing.amenities);
  const amenitiesDetails = element('details');
  amenitiesDetails.append(element('summary', '', `Amenities (${amenities.length})`));
  const list = element('ul', 'amenities');
  for (const item of amenities) list.append(element('li', '', item));
  amenitiesDetails.append(amenities.length ? list : element('p', '', 'No amenities provided.'));
  content.append(description, amenitiesDetails);
  const rate = priceNumber(listing.price);
  const priceRow = element('div', 'price-row');
  priceRow.append(element('span', 'price', Number.isFinite(rate) ? money.format(rate) : 'Price unavailable'));
  if (Number.isFinite(rate)) priceRow.append(element('span', 'muted', '/ night'));
  const estimate = element('div', 'estimate');
  estimate.dataset.index = index;
  content.append(priceRow, estimate);
  card.append(photo, content);
  return card;
}

// Creative addition: estimate base cost and split it among travelers.
function updateEstimates() {
  const valid = nightsInput.checkValidity() && travelersInput.checkValidity();
  const nights = Number(nightsInput.value);
  const travelers = Number(travelersInput.value);
  for (const node of document.querySelectorAll('.estimate')) {
    node.replaceChildren();
    if (!valid) {
      node.textContent = 'Enter whole numbers: 1–365 nights and 1–16 travelers.';
      continue;
    }
    const listing = listings[Number(node.dataset.index)];
    const rate = priceNumber(listing.price);
    if (!Number.isFinite(rate)) { node.textContent = 'Estimate unavailable.'; continue; }
    const total = rate * nights;
    node.append(element('strong', '', `${money.format(total / travelers)} per traveler`));
    node.append(element('small', '', `${money.format(total)} base total · ${nights} night${nights === 1 ? '' : 's'} · ${travelers} traveler${travelers === 1 ? '' : 's'}`));
    if (Number(listing.accommodates) > 0 && travelers > Number(listing.accommodates))
      node.append(element('small', 'warning', `This listing accommodates only ${listing.accommodates} guests.`));
    if (nights < Number(listing.minimum_nights))
      node.append(element('small', 'warning', `Minimum stay: ${listing.minimum_nights} nights.`));
    if (Number(listing.maximum_nights) > 0 && nights > Number(listing.maximum_nights))
      node.append(element('small', 'warning', `Maximum stay: ${listing.maximum_nights} nights.`));
  }
}

async function loadListings() {
  statusMessage.textContent = 'Loading listings…';
  retryButton.hidden = true;
  container.setAttribute('aria-busy', 'true');
  try {
    // AJAX: request a local file without reloading the page.
    const response = await fetch('./data/listings.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error('Expected a JSON array of listings.');
    listings = data.slice(0, 50); // Slice BEFORE rendering; preserve file order.
    container.replaceChildren(...listings.map(createCard));
    updateEstimates();
    statusMessage.textContent = listings.length ? `${listings.length} stays · file order` : 'No listings found.';
  } catch (error) {
    container.replaceChildren();
    statusMessage.textContent = 'Unable to load listings. Check the JSON file and run this page using a local web server.';
    retryButton.hidden = false;
    console.error('Loading failed:', error);
  } finally {
    container.setAttribute('aria-busy', 'false');
  }
}

nightsInput.addEventListener('input', updateEstimates);
travelersInput.addEventListener('input', updateEstimates);
retryButton.addEventListener('click', loadListings);
loadListings();
