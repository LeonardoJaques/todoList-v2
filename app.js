const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const _ = require('lodash');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema)

const item1 = new Item({
  name: "Welcome to your todolist!"
});
const defaultItems = [item1]

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);



app.get('/', (req, res) => {

  Item.find({}, (err, foundItems) => {

    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully saved default items to DB");
        }
      });
      res.redirect('/');
    } else {

      res.render("list", {
        listTitle: "Today",
        newListItems: foundItems
      });
    }
  });

});

app.get('/:customListname', (req, res) => {
  const customListname = _.capitalize(req.params.customListname);

  List.findOne({
    name: customListname
  }, (err, foundList) => {
    if (!err) {
      if (!foundList) {
        // Create a new list
        const list = new List({
          name: customListname,
          items: defaultItems
        });
        list.save();
        res.redirect('/' + customListname);
      } else {
        // Show an existing list
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items
        });
      }
    }
  });
});

app.post('/', (req, res) => {
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  });
  if (listName === "Today") {
    item.save();
    res.redirect('/')
  } else {
    List.findOne({
      name: listName
    }, (err, foundList) => {
      foundList.items.push(item);
      foundList.save()
      res.redirect('/' + listName);
    })
  }
});

app.post('/delete', (req, res) => {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findOneAndDelete(checkedItemId, function (err) {
      if (!err) {
        console.log(`Successfully deleted item id: ${checkedItemId}`);
        res.redirect('/')
      }
    });
  } else {
    List.findOneAndUpdate({
      name: listName
    }, {
      $pull: {
        items: {
          _id: checkedItemId
        }
      }
    }, (err) => {
      if (!err) {
        res.redirect('/' + listName);
      }
    });
  }

});

app.get('/about', (req, res) => {
  res.render("about")
})

const port = 3000 || process.env.port;
app.listen(port, () => {
  console.log(`Server started on port: ${port}`)
});