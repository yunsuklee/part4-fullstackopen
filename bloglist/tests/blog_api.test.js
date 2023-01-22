const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')

const api = supertest(app)
const Blog = require('../models/blog')

beforeEach(async () => {
  await Blog.deleteMany({})

  for (let blog of helper.initialBlogs) {
    let blogObject = new Blog(blog)
    await blogObject.save()
  }
})

/*
  Verify that the blog list app returns the correct amount
  of blog posts in JSON format
*/

// Test for JSON format
test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
}, 10000)

// Test for correct amount of blog posts
test('all blog posts are returned', async () => {
  const response = await api.get('/api/blogs')

  expect(response.body).toHaveLength(helper.initialBlogs.length)
})

// Test for unique identifier id
test('verifying existence of property id', async () => {
  const response = await api.get('/api/blogs')

  response.body.forEach(blog => expect(blog.id).toBeDefined())
})

// Test creating a new blog
test('a valid blog can be added', async () => {
  const newBlog = {
    title: 'Adding test blog',
    author: 'FullStackOpen',
    url: 'https://fullstackopen.com',
    likes: 500
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const blogsAfterAdding = await helper.blogsInDb()
  expect(blogsAfterAdding).toHaveLength(helper.initialBlogs.length + 1)

  const titles = blogsAfterAdding.map(b => b.title)
  expect(titles).toContain('Adding test blog')
})

// Test missing likes property
test('if likes is missing it will default to 0', async () => {
  const newBlog = {
    title: 'No likes blog',
    author: 'Sergio Lee',
    url: 'https://twitter.com'
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const blogsAfterAdding = await helper.blogsInDb()
  expect(blogsAfterAdding).toHaveLength(helper.initialBlogs.length + 1)

  expect(blogsAfterAdding.at(-1).likes).toBe(0)
})

afterAll(() => {
  mongoose.connection.close()
})