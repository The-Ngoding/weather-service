/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('weathers', function (table) {
        table.increments('id').primary();
        table.string('uuid').unique();
        table.float('weather');
        table.string('weather_status').notNullable();
        table.timestamp('date').defaultTo(knex.fn.now());
      });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('weathers');
};
