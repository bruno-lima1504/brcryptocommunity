import database from "infra/database";
import password from "models/password";
import { ValidationError, NotFoundError } from "infra/errors";

async function create(userInputValue) {
  await validadeUniqueUsername(userInputValue.username);
  await validadeUniqueEmail(userInputValue.email);
  await hashPasswordInObject(userInputValue);

  const newUser = await runInsertQuery(userInputValue);
  return newUser;

  async function runInsertQuery(userInputValue) {
    const results = await database.query({
      text: `
          INSERT INTO
           users (username, email, password) 
          VALUES
           ($1, $2, $3)
          RETURNING
           *
          ;`,
      values: [
        userInputValue.username,
        userInputValue.email,
        userInputValue.password,
      ],
    });
    return results.rows[0];
  }
}

async function findOneById(id) {
  const userFound = await runSelectQuery(id);
  return userFound;

  async function runSelectQuery(id) {
    const results = await database.query({
      text: `
      SELECT
       *
      FROM
       users
      WHERE
       id = $1
      LIMIT 1
      ;`,
      values: [id],
    });
    if (results.rowCount === 0) {
      throw new NotFoundError({
        message: "O id informado não foi encontrado no sistema.",
        action: "Verifique se o id está digitado corretamente.",
      });
    }
    return results.rows[0];
  }
}

async function findOneByUsername(username) {
  const userFound = await runSelectQuery(username);
  return userFound;

  async function runSelectQuery(username) {
    const results = await database.query({
      text: `
      SELECT
       *
      FROM
       users
      WHERE
       LOWER(username) = LOWER($1)
      LIMIT 1
      ;`,
      values: [username],
    });
    if (results.rowCount === 0) {
      throw new NotFoundError({
        message: "O usuário não foi encontrado no sistema.",
        action: "Verifique se o username está digitado corretamente.",
      });
    }
    return results.rows[0];
  }
}

async function findOneByEmail(email) {
  const userFound = await runSelectQuery(email);
  return userFound;

  async function runSelectQuery(email) {
    const results = await database.query({
      text: `
      SELECT
       *
      FROM
       users
      WHERE
       LOWER(email) = LOWER($1)
      LIMIT 1
      ;`,
      values: [email],
    });
    if (results.rowCount === 0) {
      throw new NotFoundError({
        message: "O email não foi encontrado no sistema.",
        action: "Verifique se o email está digitado corretamente.",
      });
    }
    return results.rows[0];
  }
}

async function update(username, userInputValues) {
  const currentUser = await findOneByUsername(username);

  if ("username" in userInputValues) {
    if (userInputValues.username.toLowerCase() !== username.toLowerCase()) {
      await validadeUniqueUsername(userInputValues.username);
    }
  }

  if ("email" in userInputValues) {
    if (
      userInputValues.email.toLowerCase() !== currentUser.email.toLowerCase()
    ) {
      await validadeUniqueEmail(userInputValues.email);
    }
  }

  if ("password" in userInputValues) {
    await hashPasswordInObject(userInputValues);
  }

  const userWithNewsValues = { ...currentUser, ...userInputValues };

  const updatedUser = await runUpdateQuery(userWithNewsValues);
  return updatedUser;

  async function runUpdateQuery(userWithNewsValues) {
    const results = await database.query({
      text: `
        UPDATE
         users
        SET
         username = $1,
         email = $2,
         password = $3,
         updated_at = timezone('utc', now())
        WHERE 
          id = $4 
        RETURNING *
        ;`,
      values: [
        userWithNewsValues.username,
        userWithNewsValues.email,
        userWithNewsValues.password,
        currentUser.id,
      ],
    });
    return results.rows[0];
  }
}

async function validadeUniqueUsername(username) {
  const results = await database.query({
    text: `
        SELECT 
          username
        FROM
          users
        WHERE
          LOWER(username) = LOWER($1)
        ;`,
    values: [username],
  });
  if (results.rowCount > 0) {
    throw new ValidationError({
      message: "Username informado já está sendo utilizado.",
      action: "Utilize outro username para realizar esta operação.",
    });
  }
}

async function validadeUniqueEmail(email) {
  const results = await database.query({
    text: `
        SELECT 
          email
        FROM
          users
        WHERE
          LOWER(email) = LOWER($1)
        ;`,
    values: [email],
  });
  if (results.rowCount > 0) {
    throw new ValidationError({
      message: "Email informado já está sendo utilizado.",
      action: "Utilize outro email para realizar esta operação.",
    });
  }
}

async function hashPasswordInObject(userInputValue) {
  const hashedPassword = await password.hash(userInputValue.password);
  userInputValue.password = hashedPassword;
}

const user = {
  create,
  findOneById,
  findOneByUsername,
  findOneByEmail,
  update,
};

export default user;
