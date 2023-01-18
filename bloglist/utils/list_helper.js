// eslint-disable-next-line no-unused-vars
const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((likes, blog) => (
    likes + blog.likes
  ), 0)
}

const favoriteBlog = (blogs) => {
  let favorite = {}

  blogs.forEach(blog => {
    if (!favorite.likes) favorite.likes = 0

    if (blog.likes > favorite.likes) {
      favorite = { ...blog }
    }
  })

  return favorite
}

const mostBlogs = (blogs) => {
  const bloggers = []

  blogs.forEach(blog => {
    const index = bloggers.findIndex(blogger => blogger.author === blog.author)

    if (index > -1) {
      bloggers[index].blogs += 1
    } else {
      bloggers.push({ author: blog.author, blogs: 1 })
    }
  })

  let topBlogger = {}

  bloggers.forEach(blogger => {
    if (!topBlogger.blogs) topBlogger.blogs = 0

    if (blogger.blogs > topBlogger.blogs) {
      topBlogger = { ...blogger }
    }
  })

  return topBlogger
}

const mostLikes = (blogs) => {
  const bloggers = []

  blogs.forEach(blog => {
    const index = bloggers.findIndex(blogger => blogger.author === blog.author)

    if (index > -1) {
      bloggers[index].likes += blog.likes
    } else {
      bloggers.push({ author: blog.author, likes: blog.likes })
    }
  })

  let topBlogger = {}

  bloggers.forEach(blogger => {
    if (!topBlogger.likes) topBlogger.likes = 0

    if (blogger.likes > topBlogger.likes) {
      topBlogger = { ...blogger }
    }
  })

  return topBlogger
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}