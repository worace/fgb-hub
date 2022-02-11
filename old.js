/* class UI {
 *   constructor(url) {
 *     this.url = url;
 *     this.updateResults = _.throttle(this._updateResults.bind(this), 500);
 *   }
 * 
 *   async init() {
 *     this.map = L.map('map').setView([39, -104], 10);
 *     L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
 *       maxZoom: 19,
 *       attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
 *     }).addTo(this.map);
 * 
 *     let r = this.updateResults();
 *     await r;
 * 
 *     this.map.on("moveend", () => {
 *       this.updateResults();
 *     });
 *   }
 * 
 *   handleHeaderMeta(headerMeta) {
 *     console.log('recvdf header meta', JSON.stringify(headerMeta));
 *     /* const header = document.getElementById('header')
 *      * const formatter = new JSONFormatter(headerMeta, 10)
 *      * header.appendChild(JSON.stringify(headerMeta)); */
*   }
* 
* async _updateResults() {
  * console.log('update results...');
  *     // remove the old results
  *     if (this.previousResults) {
    * console.log('clear previosu results');
    * this.previousResults.remove();
    *     }
  *     const nextResults = L.layerGroup().addTo(this.map);
  * this.previousResults = nextResults;
  * 
  *     // Use flatgeobuf JavaScript API to iterate features as geojson.
  *     // Because we specify a bounding box, flatgeobuf will only fetch the relevant subset of data,
  *     // rather than the entire file.
  * let iter = flatgeobuf.deserialize(this.url, this.bbox(), this.handleHeaderMeta.bind(this));
  * let numFeatures = 0;
  *     for await (let feature of iter) {
    *       if (numFeatures > 5000) {
      * console.log('received 2000 features, stopping');
      *         break;
      *       }
    *       const defaultStyle = {
      *         color: 'blue',
      *         weight: 2,
      *         fillOpacity: 0.1,
      *       };
    * 
    *       const bb = this.bbox();
    *       const bbString = [bb.minX, bb.minY, bb.maxX, bb.maxY].join(",");
    * console.log('update bbox:');
    * document.getElementById('bbox').textContent = bbString;
    * 
    * L.geoJSON(feature, {
        *         style: defaultStyle,
        *       }).addTo(nextResults);
    * numFeatures += 1;
    *     }
  *   }
* 
*   // For the example, we fix a visible Rect representing the query
*   // bounding box in the middle of the map
* boundsForRect() {
  *     const widthMeters = 500000;
  * console.log('boundsForRect', this.map.getCenter());
  * console.log('boundsForRect -width', this.map.getCenter().toBounds(widthMeters));
  *     return this.map.getCenter().toBounds(widthMeters);
  *   }
* 
* bbox() {
  *     const bounds = this.boundsForRect();
  *     return {
    *       minX: bounds._southWest.lng,
    *       minY: bounds._southWest.lat,
    *       maxX: bounds._northEast.lng,
    *       maxY: bounds._northEast.lat,
    *     };
  *   }
* 
* latLngBounds() {
  *     const bb = this.bbox();
  *     return L.latLngBounds(
    * L.latLng(bb.minY, bb.minX),
    * L.latLng(bb.maxY, bb.maxX)
      *     );
  *   }
* }
* 
* document.addEventListener("DOMContentLoaded", () => {
  *   const url = new URLSearchParams(window.location.search).get("url");
  * 
  *   if (url == null) {
    * alert("Missing 'url' query param pointing to a .fgb file.");
    *   } else {
      * document.getElementById('url').textContent = url;
      *     const ui = new UI(url)
            * ui.init();
      *   }
  * }); * /
