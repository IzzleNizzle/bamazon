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
  showItems(chooseBuy);
});

function chooseBuy() {

  inquirer
    .prompt([
      {
        type: "input",
        message: "Which item id would you like to buy? (Please type Item ID #)",
        name: "userInput"
      },
      {
        type: "input",
        message: "How many items do you want?",
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
          chooseBuy();
        } else {
          // if input results in a match, move forward
          var stock = res[0].stock_quantity;
          var price = res[0].price;

          //once we have quantity, then perform if statement to see if user request is possible due to inventory

          // TO-DO - CLEAN INPUT FOR NOT DIGIT INPUTS
          if (inquirerResponse.quantity > stock) {
            console.log("Insufficient quantity!");
            chooseBuy();
          } else {

            // perform this math ----> items inventory - users choice = remaining amount
            var remainingAmount = stock - inquirerResponse.quantity;
            
            // update quantity of item in database to the remaining amount
            connection.query("UPDATE products SET stock_quantity = ? WHERE item_id = ?", [remainingAmount, inquirerResponse.userInput], function (err, res) {
              if (err) throw err;

              showTotal(price, inquirerResponse.quantity)

            });




          }

        }

      });

    });

}

// calculate price of order by multiplying items bought by price of item.
function showTotal(price, quantity) {

  console.log('Your order costs: $' + (price * quantity));

  showItems(chooseBuy);

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