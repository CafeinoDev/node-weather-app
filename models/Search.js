const fs = require('fs');

const axios = require('axios');

class Search {

    history = ['Tegucigalpa', 'Madrid', 'Bogotá', 'Ciudad de México'];
    dbPath = './db/database.json';

    constructor(){
        this.readDb();
    }

    get capitalizedHistory(){
        const history = this.history.map( city => ( city.split(' ').map( ([f, ...rest]) => f.toUpperCase() + rest.join('') ).join(' ') ) )

        return history;
    }

    get paramsMapbox(){
        return {
            'language':'es',
            'limit': 5,
            'access_token': process.env.MAPBOX_KEY
        }
    }

    paramsWeather( lat, lon ){
        return {
            lat,
            lon,
            'units': 'metric',
            'lang': 'es',
            'appid': process.env.OPENWEATHER_KEY
        }
    }

    async city( name = '' ){
        try{
            // Http request
            const intance = axios.create({
                baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${ name }.json`,
                params: this.paramsMapbox
            })

            const rest = await intance.get();
    
            return rest.data.features.map( place => ({
                id: place.id,
                name: place.place_name,
                lng: place.center[0],
                lat: place.center[1],
            }) );

        }catch(error){
            return [];
        }

        return []; // Return citys
    }

    async weatherByCoords( lat, lon ){
        try {
            // Instance axios.create
            const instance = axios.create({
                baseURL: `https://api.openweathermap.org/data/2.5/weather`,
                params: this.paramsWeather(lat, lon)
            })

            const { data } = await instance.get();


            return {
                desc: data.weather[0].description,
                min: data.main.temp_min,
                max: data.main.temp_max,
                normal: data.main.temp
            }

        } catch (error) {
            console.log(error)
        }
    }

    addToHistory( city = '' ){

        if( this.history.includes( city.toLocaleLowerCase() ) ) return;

        this.history.unshift( city.toLocaleLowerCase() );

        this.storeDb();
    }

    storeDb() {

        const payload = {
            history: this.history
        }

        fs.writeFileSync( this.dbPath, JSON.stringify(payload) );

    }

    readDb() {
        if( ! fs.existsSync( this.dbPath ) ) return;

        const db = fs.readFileSync(this.dbPath, {
            enconding: 'utf-8'
        });

        const data = JSON.parse(db);

        this.history = data.history;
    }

}

module.exports = Search;