const mysql = require("mysql");
const fs = require("fs");
const path = require("path");

const pool = mysql.createPool({
  connectionLimit: 100,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

exports.upit = (req, res) => {
  res.render("upload");
};

// view users
exports.view = (req, res) => {
  // Check if the user is authenticated
  if (req.session.user) {
    // User is authenticated, proceed with rendering the view

    // Connect to the database and retrieve data
    pool.getConnection((err, connection) => {
      if (err) throw err;
      console.log("Connected as ID " + connection.threadId);

      // Use the connection to query the database
      connection.query(
        'SELECT * FROM user WHERE status = "active"',
        (err, rows) => {
          // When done with the connection, release it
          connection.release();
          if (!err) {
            res.render("home", { rows });
          } else {
            console.log(err);
          }
        }
      );
    });
  } else {
    // User is not authenticated, redirect to the login page or handle as needed
    res.render("login", { alert: "kindly login" }); // Change this to the login route
  }
};

// find user by search
exports.find = (req, res) => {
  // Check if the user is authenticated
  if (req.session.user) {
    // User is authenticated, proceed with searching for users

    // Connect to the database and retrieve data
    pool.getConnection((err, connection) => {
      if (err) throw err;
      console.log("Connected as ID " + connection.threadId);

      let searchTerm = req.body.search;

      // Use the connection to query the database
      connection.query(
        "SELECT * FROM user WHERE first_name LIKE ? OR last_name LIKE ?",
        ["%" + searchTerm + "%", "%" + searchTerm + "%"],
        (err, rows) => {
          // When done with the connection, release it
          connection.release();
          if (!err) {
            res.render("home", { rows });
          } else {
            console.log(err);
          }
          console.log("The data from user table: \n", rows);
        }
      );
    });
  } else {
    // User is not authenticated, redirect to the login page or handle as needed
    res.render("login", { alert: "kindly log in" }); // Change this to the login route
  }
};

exports.form = (req, res) => {
  // Check if the user is authenticated
  if (req.session.user) {
    // User is authenticated, render the "adduser" form

    res.render("adduser");
  } else {
    // User is not authenticated, redirect to the login page or handle as needed
    res.render("login"); // Change this to the login route
  }
};

exports.login = (req, res) => {
  res.render("login");
};

// add new user
exports.create = (req, res) => {
  const { first_name, last_name, email, phone, comments } = req.body;
  const status = "active";
  const uploadedImage = req.files.image;
  const { name, data } = uploadedImage;

  // Check if the user is authenticated
  if (req.session.user) {
    // User is authenticated, proceed with user creation

    const file = req.files.image;
    const filename = file.name;

    file.mv("./public/images/" + filename, function (err) {
      if (err) {
        res.send(err);
      } else {
        // User authenticated and image uploaded successfully, proceed with user creation
        const insertQuery =
          "INSERT INTO user (first_name, last_name, email, phone, comments, status, name, data) VALUES(?, ?, ?, ?, ?, ?, ?, ?)";

        pool.query(
          insertQuery,
          [first_name, last_name, email, phone, comments, status, name, data],
          (err, rows) => {
            if (err) {
              console.error("Error inserting user into MySQL: " + err);
              return res.render("adduser", {
                alert: "Error adding the user to the database.",
              });
            }

            res.render("adduser", { alert: "User added successfully." });
            console.log("The data from the user table: \n", rows);
          }
        );
      }
    });
  } else {
    // User is not authenticated, redirect to the login page or handle as needed
    res.render("login", { alert: "Kindly login" }); // Change this to the login route
  }
};

// edit user
exports.edit = (req, res) => {
  // Check if the user is authenticated
  if (req.session.user) {
    // User is authenticated, proceed with the edit page
    pool.getConnection((err, connection) => {
      if (err) throw err;
      console.log("Connected as ID " + connection.threadId);

      connection.query(
        "SELECT * FROM user WHERE id = ?",
        [req.params.id],
        (err, rows) => {
          connection.release();
          if (!err) {
            res.render("edit-user", { rows });
          } else {
            console.log(err);
          }
          console.log("The data from the user table: \n", rows);
        }
      );
    });
  } else {
    // User is not authenticated, redirect to the login page or handle as needed
    res.render("login", { alert: "Kindly login" }); // Change this to the login route
  }
};

// update user
// exports.update = (req, res) => {
//   // Check if the user is authenticated
//   if (req.session.user) {
//     const { first_name, last_name, email, phone, comments, document1, document2, document3 } = req.body;
//     // connect to db
//     pool.getConnection((err, connection) => {
//       if (err) throw err;
//       console.log("Connected as ID " + connection.threadId);
//       //user the conection
//       connection.query(
//         "UPDATE user SET first_name = ?, last_name = ?, email = ?, phone = ?, comments = ?, document1 = ?, document2 = ? WHERE id = ?,",
//         [first_name, last_name, email, phone, comments, document1, document2, document3, req.params.id],
//         (err, rows) => {
//           connection.release();
//           if (!err) {
//             pool.getConnection((err, connection) => {
//               if (err) throw err;
//               console.log("Connected as ID " + connection.threadId);
//               //user the conection
//               connection.query(
//                 "SELECT * FROM user WHERE id = ?",
//                 [req.params.id],
//                 (err, rows) => {
//                   connection.release();
//                   if (!err) {
//                     res.render("edit-user", {
//                       rows,
//                       alert: `${first_name} has being updated.`,
//                     });
//                   } else {
//                     console.log(err);
//                   }
//                   console.log("The data from user table: \n", rows);
//                 }
//               );
//             });
//           } else {
//             console.log(err);
//           }
//           console.log("The data from user table: \n", rows);
//         }
//       );
//     });
//   } else {
//     // User is not authenticated, redirect to the login page or handle as needed
//     res.render("login", { alert: "Kindly login" }); // Change this to the login route
//   }
// };


exports.update = (req, res) => {
  // Check if the user is authenticated
  if (req.session.user) {
    const { first_name, last_name, email, phone, comments } = req.body;

    // Handle file uploads
    const uploadedDocuments = req.files;

    // Check if uploadedDocuments and its properties exist
    if (
      uploadedDocuments &&
      uploadedDocuments.document1
    ) {
      const document1Name = uploadedDocuments.document1.name;

      // Move uploaded files to the specified folder
      uploadedDocuments.document1.mv("./public/documents/" + document1Name);

      // Update user information in the database
      pool.getConnection((err, connection) => {
        if (err) throw err;
        console.log("Connected as ID " + connection.threadId);

        const updateQuery =
          "UPDATE user SET first_name = ?, last_name = ?, email = ?, phone = ?, comments = ?, document1 = ? WHERE id = ?";

        connection.query(
          updateQuery,
          [
            first_name,
            last_name,
            email,
            phone,
            comments,
            document1Name,
            req.params.id,
          ],
          (err, rows) => {
            connection.release();

            if (!err) {
              pool.getConnection((err, connection) => {
                if (err) throw err;
                console.log("Connected as ID " + connection.threadId);

                const selectQuery = "SELECT * FROM user WHERE id = ?";

                connection.query(selectQuery, [req.params.id], (err, rows) => {
                  connection.release();

                  if (!err) {
                    res.render("edit-user", {
                      rows,
                      alert: `${first_name} has been updated.`,
                    });
                  } else {
                    console.log(err);
                  }
                });
              });
            } else {
              console.log(err);
            }
          }
        );
      });
    } else {
      // Handle the case where the required files are not provided
      res.status(400).send('Invalid or missing file uploads.');
    }
  } else {
    // User is not authenticated, redirect to the login page or handle as needed
    res.render("login", { alert: "Kindly login" }); // Change this to the login route
  }
};





// exports.update = (req, res) => {
//   // Check if the user is authenticated
//   if (req.session.user) {
//     const { first_name, last_name, email, phone, comments } = req.body;

//     // Handle file uploads
//     const uploadedDocuments = req.files;
//     const document1Name = uploadedDocuments.document1.name;
//     const document2Name = uploadedDocuments.document2.name;
//     const document3Name = uploadedDocuments.document3.name;

//     // Move uploaded files to the specified folder
//     uploadedDocuments.document1.mv("./public/images/" + document1Name);
//     uploadedDocuments.document2.mv("./public/images/" + document2Name);
//     uploadedDocuments.document3.mv("./public/images/" + document3Name);

//     // Update user information in the database
//     pool.getConnection((err, connection) => {
//       if (err) throw err;
//       console.log("Connected as ID " + connection.threadId);

//       const updateQuery =
//         "UPDATE user SET first_name = ?, last_name = ?, email = ?, phone = ?, comments = ?, document1 = ?, document2 = ?, document3 = ? WHERE id = ?";

//       connection.query(
//         updateQuery,
//         [
//           first_name,
//           last_name,
//           email,
//           phone,
//           comments,
//           document1Name,
//           document2Name,
//           document3Name,
//           req.params.id,
//         ],
//         (err, rows) => {
//           connection.release();

//           if (!err) {
//             pool.getConnection((err, connection) => {
//               if (err) throw err;
//               console.log("Connected as ID " + connection.threadId);

//               const selectQuery = "SELECT * FROM user WHERE id = ?";

//               connection.query(selectQuery, [req.params.id], (err, rows) => {
//                 connection.release();

//                 if (!err) {
//                   res.render("edit-user", {
//                     rows,
//                     alert: `${first_name} has been updated.`,
//                   });
//                 } else {
//                   console.log(err);
//                 }
//               });
//             });
//           } else {
//             console.log(err);
//           }
//         }
//       );
//     });
//   } else {
//     // User is not authenticated, redirect to the login page or handle as needed
//     res.render("login", { alert: "Kindly login" }); // Change this to the login route
//   }
// };





// Delete user
exports.delete = (req, res) => {
  // Check if the user is authenticated
  if (req.session.user) {
    pool.getConnection((err, connection) => {
      if (err) throw err;
      connection.query(
        "UPDATE user SET status = ? WHERE id = ?",
        ["removed", req.params.id],
        (err, rows) => {
          connection.release();
          if (!err) {
            let removedUser = encodeURIComponent(
              "User has being successfully removed."
            );
            res.redirect("/?removed=" + removedUser);
          } else {
            console.log(err);
          }
          console.log("The data from user table: \n" + rows);
        }
      );
    });
  } else {
    // User is not authenticated, redirect to the login page or handle as needed
    res.render("login", { alert: "Kindly login" }); // Change this to the login route
  }
};

exports.loginn = (req, res) => {
  const { username, password } = req.body;

  // Query the database to check if the username and password match
  const query = "SELECT username, password FROM users WHERE username = ?";

  pool.query(query, [username], (err, results) => {
    if (err) throw err;

    if (results.length === 1) {
      const user = results[0];

      if (password === user.password) {
        req.session.user = user;
        res.redirect("/");
      } else {
        res.render("login", { alert: "Wrong credentials" });
      }
    } else {
      res.render("login", { alert: "Username not found" });
    }
  });
};

exports.imgupload = (req, res) => {
  // Check if the user is authenticated
  if (req.session.user) {
    // User is authenticated, render the "imgupload" form

    res.render("imgupload");
  } else {
    // User is not authenticated, redirect to the login page or handle as needed
    res.render("login"); //login route
  }
};

exports.saveit = (req, res) => {
  const uploadedImage = req.files.image;
  const { name, data } = uploadedImage;

  // Save the image to MySQL
  const insertQuery = "INSERT INTO images (name, data) VALUES (?, ?)";

  pool.query(insertQuery, [name, data], (err) => {
    if (err) {
      console.error("Error saving image to MySQL: " + err);
      return res.status(500).send("Error uploading the image to the database.");
    }

    res.render("imgupload", { alert: "image uploaded succesfully" });
  });
};

// View User All
// exports.viewall = (req, res) => {
//   // Check if the user is authenticated
//   if (req.session.user) {
//     pool.getConnection((err, connection) => {
//       if (err) throw err;
//       console.log("Connected as ID " + connection.threadId);

//       // User ID from the request parameters
//       const userId = req.params.id;

//       // Query to fetch user data, including image ID
//       const userQuery = "SELECT * FROM user WHERE id = ?";

//       connection.query(userQuery, [userId], (userErr, userRows) => {
//         if (userErr) {
//           connection.release();
//           console.log(userErr);
//           return res
//             .status(500)
//             .send("Error fetching user data from the database.");
//         }

//         if (userRows.length === 1) {
//           const user = userRows[0];

//           // If the user has an associated image, fetch the image data
//           if (user.name) {
//             // Query to fetch image data from the 'images' table using the 'name' field
//             const imageQuery = "SELECT name, data FROM user WHERE name = ?";

//             connection.query(
//               imageQuery,
//               [user.name],
//               (imageErr, imageResults) => {
//                 if (imageErr) {
//                   connection.release();
//                   console.log(imageErr);
//                   return res
//                     .status(500)
//                     .send("Error fetching image data from the database.");
//                 }
//                 console.log(
//                   "Image Query:",
//                   imageQuery,
//                   [user.name],
//                   [user.data],
//                   imageResults
//                 );
//                 if (imageResults.length === 1) {
//                   const image = imageResults[0];

//                   // Set the content type based on your image format
//                   res.contentType("image/jpeg");
//                   // Send the image data as the response

//                   // const imageData = results[0].name;

//                   // Encode imageData to a Base64 Data URI
//                   const imageDataUri =
//                     "data:image/jpeg;base64," + image.toString("base64");

//                   res.send(image.data);
//                   // res.render('userProfile', { imageDataUri });

//                   // res.render("view-user", { user: user, userRows: userRows, imageDataUri });
//                 } else {
//                   connection.release();

//                   res.render("view-user", { alert: "Image not found" });
//                 }
//               }
//             );
//           } else {
//             // No associated image, so render the user's profile page without an image
//             connection.release();
//             res.render("view-user", { user: user, userRows: userRows });
//           }
//         } else {
//           connection.release();
//           res.status(404).send("User not found");
//         }
//       });
//     });
//   } else {
//     // User is not authenticated, redirect to the login page or handle as needed
//     res.render("login", { alert: "Username not found" });
//   }
// };

exports.viewall = (req, res) => {
  // Check if the user is authenticated
  if (req.session.user) {
    pool.getConnection((err, connection) => {
      if (err) throw err;
      console.log("Connected as ID " + connection.threadId);

      // User ID from the request parameters
      const userId = req.params.id;

      // Query to fetch user data, including image ID
      const userQuery = "SELECT * FROM user WHERE id = ?";

      connection.query(userQuery, [userId], (userErr, userRows) => {
        if (userErr) {
          connection.release();
          console.log(userErr);
          return res.render("view-user", {
            alert: "Error fetching user data from the database.",
          });
        }

        if (userRows.length === 1) {
          const user = userRows[0];

          // Send the image file to the client
          res.render("view-user", { user: user, userRows: userRows });
        } else {
          connection.release();
          res.render("view-user", { alert: "User not found" });
        }
      });
    });
  } else {
    // User is not authenticated, redirect to the login page or handle as needed
    res.render("login", { alert: "Username not found" });
  }
};

exports.imgview = (req, res) => {
  // Check if the user is authenticated
  if (req.session.user) {
    // User is authenticated, retrieve the image ID from the request parameters
    const imageId = req.params.id;

    const selectQuery = "SELECT name, data FROM images WHERE id = ?";

    pool.query(selectQuery, [imageId], (err, results) => {
      if (err) {
        return res.status(500).send("Error fetching image from the database.");
      }

      if (results.length === 1) {
        const image = results[0];
        // Set the content type based on your image format (e.g., image/jpeg, image/png).
        res.contentType("image/jpeg");
        // Send the image data as the response
        res.send(image.data);
      } else {
        res.status(404).send("Image not found");
      }
    });
  } else {
    // User is not authenticated, redirect to the login page or handle as needed
    res.render("login"); // login route
  }
};

// exports.docupload= (req, res) => {
//   res.render('dupload')
// }

// exports.senddoc = (req, res) => {
//   const id = req.body.id;
//   const document1 = req.files.document1.name;
//   const document2 = req.files.document2.name;
//   const document3 = req.files.document3.name;

//   req.files.document1.mv(`./public/images/${document1}`);
//   req.files.document2.mv(`./public/images/${document2}`);
//   req.files.document3.mv(`./public/images/${document3}`);

//   const sql = `
//     UPDATE user
//     SET document1 = ?, document2 = ?, document3 = ?
//     WHERE id = ?
//   `;

//   connection.query(sql, [document1, document2, document3, id], (err, result) => {
//     if (err) {
//       console.error(err);
//       res.render('dupload', { alert: 'Error updating documents.' });
//       return;
//     }

//     res.render('dupload', { alert: 'Documents updated successfully.' });
//   });
// };

exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
    }
    res.render("login", { alert: "You are Successfully logged out" });
  });
};
