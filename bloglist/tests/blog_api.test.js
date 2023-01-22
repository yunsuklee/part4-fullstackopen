const supertest = require('supertest')
const mongoose = require('mongoose')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)

const Blog = require('../models/blog')

beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(helper.initialBlogs)
})

describe('when there are some initial blog posts saved', () => {
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
})

describe('when adding new blog posts', () => {
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

  // Test bad request
  test('missing url or title', async () => {
    const noTitleBlog = {
      author: 'Sergio Lee',
      url: 'www.google.com',
      likes: 1
    }

    const noUrlBlog = {
      title: 'No url Blog',
      author: 'Sergio Lee',
      likes: 10
    }

    await api
      .post('/api/blogs')
      .send(noTitleBlog)
      .expect(400)

    await api
      .post('/api/blogs')
      .send(noUrlBlog)
      .expect(400)

    const blogsAfterAdding = await helper.blogsInDb()
    expect(blogsAfterAdding).toHaveLength(helper.initialBlogs.length)
  })
})

describe('manipulating already existing blog posts', () => {
  // Test for deleting a single blog post
  test('deleting a single blog post', async () => {
    const blogsBeforeDeletion = await helper.blogsInDb()
    const blogToDelete = blogsBeforeDeletion[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(204)

    const blogsAfterDeletion = await helper.blogsInDb()
    expect(blogsAfterDeletion).toHaveLength(helper.initialBlogs.length - 1)
  })

  // Test for updating a blog post
  test('updating blog post information', async () => {
    const blogsBeforeUpdate = await helper.blogsInDb()
    const blogToUpdate = blogsBeforeUpdate[0]

    const updatedBlog = {
      likes: 10000
    }

    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(updatedBlog)
      .expect(200)

    const blogsAfterUpdate = await helper.blogsInDb()
    expect(blogsAfterUpdate[0].likes).toBe(10000)
  })
})

afterAll(() => {
  mongoose.connection.close()
})