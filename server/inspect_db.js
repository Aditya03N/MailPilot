import mongoose from 'mongoose';

const inspect = async () => {
  await mongoose.connect('mongodb://localhost:27017/mailpilot');
  const teams = await mongoose.connection.db.collection('teams').find().toArray();
  const users = await mongoose.connection.db.collection('users').find().toArray();
  const convs = await mongoose.connection.db.collection('conversations').find().toArray();
  const accounts = await mongoose.connection.db.collection('emailaccounts').find().toArray();

  console.log('=== TEAMS (' + teams.length + ') ===');
  teams.forEach(t => console.log('Team:', t._id.toString(), t.name, 'Code:', t.teamCode, 'CreatedBy:', t.createdBy?.toString()));

  console.log('=== USERS (' + users.length + ') ===');
  users.forEach(u => console.log('User:', u._id.toString(), u.name, u.email, 'Role:', u.role, 'TeamId:', u.teamId?.toString()));

  console.log('=== CONVERSATIONS (' + convs.length + ') ===');
  const forUserTeam = convs.filter(c => c.teamId?.toString() === '6afa75339fe08a6930380c3a');
  console.log('CONVS FOR 6afa75339fe08a6930380c3a:', forUserTeam.length);
  forUserTeam.forEach(c => console.log('User team conv:', c._id.toString(), 'ClientId:', c.clientId?.toString(), 'Resp:', c.currentResponsibility, 'Subject:', c.subject));
  convs.slice(0, 5).forEach(c => console.log('Conv:', c._id.toString(), 'TeamId:', c.teamId?.toString(), 'ClientId:', c.clientId?.toString(), 'Resp:', c.currentResponsibility, 'Subject:', c.subject));

  console.log('=== EMAIL ACCOUNTS (' + accounts.length + ') ===');
  accounts.forEach(a => console.log('Account:', a.emailAddress, 'TeamId:', a.teamId?.toString(), 'ClientId:', a.clientId?.toString()));

  process.exit(0);
};

inspect().catch(err => {
  console.error(err);
  process.exit(1);
});
