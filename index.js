import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
const db = new pg.Client({
  user: 'myuser',
  host: 'localhost',
  database: 'permalist',
  password: 'mypassword',
  port: 5432,
})
db.connect();
let items = [
  { id: 1, title: "Buy milk" },
  { id: 2, title: "Finish homework" },
];
let latestItems = [];
async function getLatestItems(){
  latestItems = (await db.query(`select * from items`)).rows
  console.log(latestItems);

}
app.get("/", async (req, res) => {
  await getLatestItems();

  res.render("index.ejs", {
    listTitle: "Today",
    listItems: latestItems,
  });
});

app.post("/add", async (req, res) => {
  try {
    const newItem = req.body.newItem;
    console.log(newItem);
    await db.query(
      "INSERT INTO items (title) VALUES ($1)",
      [newItem]
    );
    await getLatestItems();
    console.log(latestItems);
    res.redirect("/");
  } catch (error) {
    console.error(error.message);
    res.status(500).send("An error occurred while adding the item.");
  }
});

app.post("/edit", async (req, res) => {
  try {
    const editedItemId = req.body.updatedItemId;
    const editedItemTitle = req.body.updatedItemTitle;
    await db.query("UPDATE items SET title = $1 WHERE id = $2", [editedItemTitle, editedItemId]);
    res.redirect("/");
  } catch (error) {
    console.log(error.message);
    res.status(500).send("An error occurred while updating the item.");
  }
});

app.post("/delete", async (req, res) => {
  try {
    const deletedItemId = req.body.deleteItemId;
    await db.query("delete from items where id = $1", [deletedItemId]);
    res.redirect("/");
  } catch (error) {
    console.log(error.message);
    res.status(500).send("An error occurred while deleting the item.");
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
