// import assert from 'assert';
// import models from '../src/models';

// // Use the default DB (in-memory under NODE_ENV=test)

// describe('Organization model (sqlite::memory:)', () => {
//   beforeEach(async () => {
//     await models.sequelize.sync({ force: true, logging: false, alter: true });
//   });

//   it('creates and fetches a Organization', async () => {
//     // DB is synced in beforeEach
//     const created = await models.Organization.create({
//       name: 'Happy Tails Shelter',
    
     
//     });
//     assert.ok(created.id > 0);

//     const found = await models.Animal.findByPk(created.id);
//     assert.ok(found);
//     assert.equal(found!.type, 'Dog');
  
//   });

//   // it('updates and deletes a user', async () => {
//   //   // DB is synced in beforeEach

//   //   const u = await models.User.create({ name: 'Linus', email: 'linus@example.org' });
//   //   assert.ok(u.id > 0);

//   //   // Update name and email
//   //   await models.User.update({ name: 'Linus T', email: 'linus.t@example.org' }, { where: { id: u.id } });
//   //   const updated = await models.User.findByPk(u.id);
//   //   assert.ok(updated);
//   //   assert.equal(updated!.name, 'Linus T');
//   //   assert.equal(updated!.email, 'linus.t@example.org');

//   //   // Delete and verify
//   //   await models.User.destroy({ where: { id: u.id } });
//   //   const deleted = await models.User.findByPk(u.id);
//   //   assert.equal(deleted, null);

//   //   const count = await models.User.count();
//   //   assert.equal(count, 0);
//   // });
// });
