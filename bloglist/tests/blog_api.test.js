const supertest = require('supertest')
const mongoose = require('mongoose')
const helper = require('./test_helper')
const bcrypt = require('bcrypt')
const app = require('../app')
const api = supertest(app)

const Blog = require('../models/blog')
const User = require('../models/user')

beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(helper.initialBlogs)
  await User.deleteMany({})

  const passwordHash = await bcrypt.hash('root', 10)
  const user = new User({ username: 'root', passwordHash })

  await user.save()
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
      title: 'Adding blog test',
      author: 'test',
      url: '#',
    }

    const response = await api
      .post('/api/login')
      .send({ username: 'root', password: 'root' })
      .expect(200)
      .expect('Content-Type', /application\/json/)

    await api
      .post('/api/blogs')
      .set('Authorization', 'Bearer ' + response.body.token)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAfterAdding = await helper.blogsInDb()
    expect(blogsAfterAdding).toHaveLength(helper.initialBlogs.length + 1)

    const titles = blogsAfterAdding.map(b => b.title)
    expect(titles).toContain('Adding blog test')
  })

  // Test missing likes property
  test('if likes is missing it will default to 0', async () => {
    const newBlog = {
      title: 'No likes blog',
      author: 'Sergio Lee',
      url: '#',
    }

    const response = await api
      .post('/api/login')
      .send({ username: 'root', password: 'root' })
      .expect(200)
      .expect('Content-Type', /application\/json/)

    await api
      .post('/api/blogs')
      .set('Authorization', 'Bearer ' + response.body.token)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAfterAdding = await helper.blogsInDb()
    expect(blogsAfterAdding).toHaveLength(helper.initialBlogs.length + 1)

    expect(blogsAfterAdding.at(-1).likes).toBe(0)
  })

  // Test bad request
  test('missing url or title', async () => {
    const response = await api
      .post('/api/login')
      .send({ username: 'root', password: 'root' })
      .expect(200)
      .expect('Content-Type', /application\/json/)

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
      .set('Authorization', 'Bearer ' + response.body.token)
      .send(noTitleBlog)
      .expect(400)

    await api
      .post('/api/blogs')
      .set('Authorization', 'Bearer ' + response.body.token)
      .send(noUrlBlog)
      .expect(400)

    const blogsAfterAdding = await helper.blogsInDb()
    expect(blogsAfterAdding).toHaveLength(helper.initialBlogs.length)
  })

  // Test adding blog without token
  test('adding a blog fails if a token is not provided', async () => {
    const newBlog = {
      title: 'Adding blog test',
      author: 'test',
      url: '#',
    }

    await api
      .post('/api/login')
      .send({ username: 'root', password: 'root' })
      .expect(200)
      .expect('Content-Type', /application\/json/)

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(401)

    const blogsAfterAdding = await helper.blogsInDb()
    expect(blogsAfterAdding).toHaveLength(helper.initialBlogs.length)
  })
})

describe('manipulating already existing blog posts', () => {
  // Test for deleting a single blog post
  test('deleting a single blog post', async () => {
    await Blog.deleteMany({}) // Delete all blogs

    const response = await api // login user
      .post('/api/login')
      .send({ username: 'root', password: 'root' })
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const { username } = response.body
    const user = await User.findOne({ username }) // get user

    const newBlog = { // add a blog to delete
      title: 'Adding blog test',
      author: 'test',
      url: '#',
      user: user
    }

    await api // add blog
      .post('/api/blogs')
      .set('Authorization', 'Bearer ' + response.body.token)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsBeforeDeletion = await helper.blogsInDb()
    const blogToDelete = blogsBeforeDeletion[0] // retrieve id of only blog in db

    await api // delete blog
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', 'Bearer ' + response.body.token)
      .expect(204)

    const blogsAfterDeletion = await helper.blogsInDb()
    expect(blogsAfterDeletion).toHaveLength(blogsBeforeDeletion.length - 1)
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