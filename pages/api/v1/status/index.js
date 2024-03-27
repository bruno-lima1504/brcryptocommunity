function status(request, response) {
  response.status(200).json({ chave: "valor", testeCharset: "São É %$" });
}

export default status;
