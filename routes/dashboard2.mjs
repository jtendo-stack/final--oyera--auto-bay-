app.get('/dashboard', async (req,res)=>{
  // your logic to get totalCustomers etc
  res.render('dashboard', { totalCustomers, totalServices, totalStock, recentServices })
})
app.get('/', (req,res)=> res.render('index'))