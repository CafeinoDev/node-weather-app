require('dotenv').config();

const { 
    readInput,
    inquirerMenu,
    pause,
    listCities
 } = require('./helpers/inquirer');
const Search = require('./models/Search');

const main = async() => {
    
    const search = new Search();
    let opt;

    do {
        opt = await inquirerMenu();
        
        switch (opt) {
            case 1:
                // Show message
                const term = await readInput('City to search: ');
                
                // Search cities
                const cities = await search.city( term );
                
                // Select city
                const id = await(listCities(cities));
                if( id === '0' ) continue;
                
                const { name, lat, lng } = cities.find( city => city.id === id );

                search.addToHistory( name );

                // Weather

                console.clear();

                const { desc, min, max, normal } = await search.weatherByCoords( lat, lng );

                console.log('\nInformación de la ciudad\n'.green);
                console.log('Ciudad: ', name.green);
                console.log('Lat: ', lat);
                console.log('Lng: ', lng);
                console.log('Temperatura: ', normal);
                console.log('Mínima: ', min);
                console.log('Máxima: ', max);
                console.log('Clima: ', desc.green);
            break;
            case 2:
                search.capitalizedHistory.forEach( (city, i) => {
                    const idx = `${ i + 1 }. `.green;
                    console.log( idx, city );
                })
            break;
        }

        if(opt !== 0) await pause();
    } while (opt !== 0);
}

main();