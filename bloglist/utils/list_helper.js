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

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog
}