const notFoundHandler = (_request, response) => {
  response.status(404).json({
    success: false,
    message: "Route not found"
  });
};

const errorHandler = (error, _request, response, _next) => {
  const statusCode = error.statusCode || (response.statusCode !== 200 ? response.statusCode : 500);

  response.status(statusCode).json({
    success: false,
    message: error.message || "Internal server error"
  });
};

export { notFoundHandler, errorHandler };
