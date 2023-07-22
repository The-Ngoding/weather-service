/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
const faker = require('faker');
exports.seed = async function(knex) {
 // Deletes ALL existing entries in the weathers table
 return knex('weathers')
 .del()
 .then(function () {
   // Inserts 1000 sample data records into the weathers table
   const weathers = [];
   const startDate = new Date('2023-08-01'); // Start date is 1st August 2023
   for (let i = 0; i < 1000; i++) {
     const currentDate = new Date(startDate);
     currentDate.setDate(startDate.getDate() + i); // Increment date by i days
     weathers.push({
       uuid: faker.random.uuid(),
       weather: faker.random.number({ min: 0, max: 40, precision: 2 }), // Random float between 0 and 40
       weather_status: faker.random.arrayElement(['berawan', 'hujan', 'gerimis', 'cerah']),
       date: currentDate,
     });
   }

   return knex('weathers').insert(weathers);
 });
};
