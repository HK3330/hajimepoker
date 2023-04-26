db.createUser({
  user: 'echizen',
  pwd: 'password',
  roles: [
    {
      role: 'readWrite',
      db: 'nginx-node-mongo-docker-example',
    },
  ],
})