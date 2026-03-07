class HttpStatus {
  static badRequest(res, rest = {}) {
    return res.status(500).json({
      success: false,
      ...rest,
    });
  }
  static success(res, rest = {}) {
    return res.status(200).json({
      success: true,
      ...rest,
    });
  }
  static unauthorized(res, rest = {}) {
    return res.status(401).json({
      success: false,
      ...rest,
    });
  }
}

export { HttpStatus };
