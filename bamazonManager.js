// Requiring initial packages
var inquirer = require('inquirer');
var mysql = require("mysql");

//mysql connection
var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "1234",
  database: "bamazon"
});

connection.connect(function (err) {
  if (err) throw err;
  managerView();
});


function managerView() {

  inquirer
    .prompt([
      {
        type: "list",
        message: "Select:",
        choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product"],
        name: "choice"
      }
    ])
    .then(function (inquirerResponse) {

      switch (inquirerResponse.choice) {

        case "View Products for Sale":
          //   * If a manager selects `View Products for Sale`, the app should list every available item: the item IDs, names, prices, and quantities.
          showItems(managerView);
          break;

        case "View Low Inventory":
          //   * If a manager selects `View Low Inventory`, then it should list all items with an inventory count lower than five.
          lowInventory(managerView);
          break;

        case "Add to Inventory":
          //   * If a manager selects `Add to Inventory`, your app should display a prompt that will let the manager "add more" of any item currently in the store.
          showItems(addInventory);
          break;

        case "Add New Product":
          //   * If a manager selects `Add New Product`, it should allow the manager to add a completely new product to the store.
          newProduct();
          break;
      }



    });


}


//function to print data
function showItems(callback) {

  connection.query("SELECT * FROM products", function (err, res) {
    if (err) throw err;

    for (var i = 0; i < res.length; i++) {
      console.log("Item ID: " + res[i].item_id + " | Item Name: " + res[i].product_name + " | Item Department: " + res[i].department_name + " | Item Price: $" + res[i].price + " | Item Quantity: " + res[i].stock_quantity);
    }

    callback();
  });

}


//function to print data with low quantities
function lowInventory(callback) {

  connection.query("SELECT * FROM products WHERE stock_quantity < 5", function (err, res) {
    if (err) throw err;

    // catching if there are no items with low inventory
    if (res[0] === undefined) {
      console.log('You do not have any inventory that has less than 5 quantity.');
      managerView();
    } else {

      for (var i = 0; i < res.length; i++) {
        console.log("Item ID: " + res[i].item_id + " | Item Name: " + res[i].product_name + " | Item Department: " + res[i].department_name + " | Item Price: $" + res[i].price + " | Item Quantity: " + res[i].stock_quantity);
      }

      callback();
    }
  });

}


function addInventory() {

  inquirer
    .prompt([
      {
        type: "input",
        message: "Which item id would you like to add quantity? (Please type Item ID #)",
        name: "userInput"
      },
      {
        type: "input",
        message: "How many items do you want to add?",
        name: "quantity"
      }
    ])
    .then(function (inquirerResponse) {

      // first query database for item id of the user input to find out quantity available.
      var query = "SELECT stock_quantity, price FROM products WHERE ?";
      connection.query(query, { item_id: inquirerResponse.userInput }, function (err, res) {
        if (err) throw err;

        // catching wrong input, or item numbers that do not exist
        if (res[0] === undefined) {
          console.log('You have entered an Item_ID that does not exist, please try again.');
          managerView();
        } else {

          // item id = inquirerResponse.userInput
          // userselectedquantity = inquirerResponse.quantity
          // current inventory quantity = res[0].stock_quantity;

          //update inventory
          connection.query("UPDATE products SET stock_quantity = ? WHERE item_id = ?", [res[0].stock_quantity + parseFloat(inquirerResponse.quantity), inquirerResponse.userInput], function (err, res) {
            if (err) throw err;

            //confirmation message
            console.log('Your inventory has been updated!');

            // after database has been updated, run managerView function
            managerView();

          });

        }

      });

    });

}

function newProduct() {

  //get item_id, product_name, department_name, price, stock_quantity from user to build new item
  inquirer
    .prompt([
      {
        type: "input",
        message: "Please enter Item_ID: ",
        name: "item_id"
      },
      {
        type: "input",
        message: "Please enter Product Name: ",
        name: "product_name"
      },
      {
        type: "list",
        message: "Please choose a Department Name: ",
        choices: ["Clothing", "Electronics", "Sporting Goods", "Other"],
        name: "department_name"
      },
      {
        type: "input",
        message: "Please enter Product Price: ",
        name: "price"
      },
      {
        type: "input",
        message: "Please enter Stock Quantity: ",
        name: "stock_quantity"
      }
    ])
    .then(function (inquirerResponse) {

      // input data into database and send confirmation message
      // Insert new product into database
      connection.query("INSERT INTO products (item_id, product_name, department_name, price, stock_quantity) VALUES (?,?,?,?,?)", [parseFloat(inquirerResponse.item_id), inquirerResponse.product_name, inquirerResponse.department_name, parseFloat(inquirerResponse.price), parseFloat(inquirerResponse.stock_quantity)], function (err, res) {
        if (err) throw err;

        //confirmation message
        console.log(inquirerResponse.product_name + ' has been added to your store!');

        // after database has been updated, run managerView function
        managerView();

      });
    });
}