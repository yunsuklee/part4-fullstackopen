const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((likes, blog) => (
    likes + blog.likes
  ), 0)
}

module.exports = {
  dummy,
  totalLikes
}