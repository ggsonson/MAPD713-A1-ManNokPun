var SERVER_NAME = 'image-api'
var PORT = 5001;
var HOST = '127.0.0.1';

var requestCount = {post: 0, get:0}

var restify = require('restify')

  // Get a persistence engine for the images
  , imagesSave = require('save')('images')

  // Create the restify server
  , server = restify.createServer({ name: SERVER_NAME})

  server.listen(PORT, HOST, function () {
  console.log('Server %s listening at %s', server.name, server.url)
  console.log(`Endpoints: ${server.url} method: GET, POST, DELETE`)
  console.log(`> images GET: id (path param)` )
  console.log(`< images GET: Images json array`)
  console.log(`> images POST: Images json array (request body)` )
  console.log(`< images POST: Image json array`)
  console.log(`> images DELETE: No parameters` )
  console.log(`< images DELETE: "OK" Text`)
})

server
  // Allow the use of POST
  .use(restify.fullResponse())

  // Maps req.body to req.params so there is no switching between them
  .use(restify.bodyParser())

// Get all images in the system
server.get('/images', function (req, res, next) {
  // Add request count and print
  requestCount.get ++
  console.log(`Processed Request Count --> Get: ${requestCount.get}, Post: ${requestCount.post}`)

  // Find every entity within the given collection
  imagesSave.find({}, function (error, images) {

    // Return all of the images in the system
    res.send(images)
  })
})

// Get a single image by their image id
server.get('/images/:id', function (req, res, next) {
  // Add request count and print
  requestCount.get ++
  console.log(`Processed Request Count --> Get: ${requestCount.get}, Post: ${requestCount.post}`)

  // Find a single image by their id within save
  imagesSave.findOne({ _id: req.params.id }, function (error, image) {

    // If there are any errors, pass them to next in the correct format
    if (error) return next(new restify.InvalidArgumentError(JSON.stringify(error.errors)))

    if (image) {
      // Send the image if no issues
      res.send(image)
    } else {
      // Send 404 header if the image doesn't exist
      res.send(404)
    }
  })
})

// Create a new image
server.post('/images', function (req, res, next) {
  // Add request count and print
  requestCount.post ++
  console.log(`Processed Request Count --> Get: ${requestCount.get}, Post: ${requestCount.post}`)
  
  // Make sure name is defined
  if (req.params.name === undefined ) {
    // If there are any errors, pass them to next in the correct format
    return next(new restify.InvalidArgumentError('name must be supplied'))
  }
  if (req.params.url === undefined ) {
    // If there are any errors, pass them to next in the correct format
    return next(new restify.InvalidArgumentError('url must be supplied'))
  }
  if (req.params.size === undefined ) {
    // If there are any errors, pass them to next in the correct format
    return next(new restify.InvalidArgumentError('size must be supplied'))
  }

  var newImage = {
		name: req.params.name, 
		url: req.params.url,
    size: req.params.size
	}

  // Create the image using the persistence engine
  imagesSave.create( newImage, function (error, image) {

    // If there are any errors, pass them to next in the correct format
    if (error) return next(new restify.InvalidArgumentError(JSON.stringify(error.errors)))
    console.log(`Image created: ${JSON.stringify(image)}`)
    // Send the image if no issues
    res.send(201, image)
  })
})

// Delete images
server.del('/images', function (req, res, next) {

  // Delete all images
  imagesSave.deleteMany(true, function (error, image) {

    // If there are any errors, pass them to next in the correct format
    if (error) return next(new restify.InvalidArgumentError(JSON.stringify(error.errors)))

    // Send a 200 OK response
    res.send("OK")
  })
})

