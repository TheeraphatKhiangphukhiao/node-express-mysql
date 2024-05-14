import express from "express";
import mysql from "mysql";
import { TripPostRequest } from "../model/tripModel";
import util from "util";

export const router = express.Router();

export const conn = mysql.createPool({
    connectionLimit: 10,
    host: "202.28.34.197",
    user: "tripbooking",
    password: "tripbooking@csmsu",
    database: "tripbooking",
});

router.get("/", (req, res) => {
    if (req.query) {
        if (req.query.id) {
            res.status(200).send("Get in trip.ts Query id: " + req.query.id);
        } else if (req.query.name) {
            res.status(200).send("Get in trip.ts Query name: " + req.query.name);
        }
    } else {
        conn.query('select * from trip', (err, result, fields) => {
            if (err) {
                res.status(400).json(err);
            } else {
                res.status(200).json(result);
            }
        });
        // res.send("Get in trip.ts");
    }
});
router.get("/:id", (req, res) => {
    let id = +req.params.id;
    conn.query("select * from trip where idx = ?", [id], (err, result, fields) => {
        if (err) {
            res.status(400).json(err);
        } else {
            res.status(200).json(result);
        }
    });
    // res.send("Get in trip.ts id: " + req.params.id);
});
router.post("/", (req, res) => {
  let trip: TripPostRequest = req.body;
  let sql = "INSERT INTO `trip`(`name`, `country`, `destinationid`, `coverimage`, `detail`, `price`, `duration`) VALUES (?,?,?,?,?,?,?)";
  sql = mysql.format(sql, [
    trip.name,
    trip.country,
    trip.destinationid,
    trip.coverimage,
    trip.detail,
    trip.price,
    trip.duration,
  ]);
  conn.query(sql, (err, result) => {
    if (err) throw err;
    res.status(201).json({ affected_row: result.affectedRows, last_idx: result.insertId });
  });
});
router.get("/search/fields", (req, res) => {
    conn.query(
        "select * from trip where (idx IS NULL OR idx = ?) OR (name IS NULL OR name like ?)",
        [ req.query.id, "%" + req.query.name + "%"],
        (err, result, fields) => {
        if (err) throw err;
          res.json(result);
        }
      );
});
router.delete("/:id", (req, res) => {
    let id = +req.params.id;
    conn.query("delete from trip where idx = ?", [id], (err, result) => {
       if (err) throw err;
       res.status(200).json({ affected_row: result.affectedRows });
    });
});
/*
router.put("/:id", (req, res) => {
    let id = +req.params.id;
    let trip: TripPostRequest = req.body;
    let sql = "update  `trip` set `name`=?, `country`=?, `destinationid`=?, `coverimage`=?, `detail`=?, `price`=?, `duration`=? where `idx`=?";
    sql = mysql.format(sql, [
        trip.name,
        trip.country,
        trip.destinationid,
        trip.coverimage,
        trip.detail,
        trip.price,
        trip.duration,
        id
    ]);
    conn.query(sql, (err, result, fields) => {
        if (err) {
            res.status(400).json(err);
        } else {
            res.status(201).json({ affected_row: result.affectedRows });
        }
    });
});
*/

router.put("/:id", async (req, res) => {
    let id = +req.params.id;
    let trip: TripPostRequest = req.body;
    let tripOriginal: TripPostRequest | undefined;
    const queryAsync = util.promisify(conn.query).bind(conn);

    let sql = mysql.format("select * from trip where idx = ?", [id]);
  
    let result = await queryAsync(sql);
    const rawData = JSON.parse(JSON.stringify(result));
    console.log(rawData);
    tripOriginal = rawData[0] as TripPostRequest;
    console.log(tripOriginal);
  
    let updateTrip = {...tripOriginal, ...trip};
    console.log(trip);
    console.log(updateTrip);
  
    sql = "update `trip` set `name`=?, `country`=?, `destinationid`=?, `coverimage`=?, `detail`=?, `price`=?, `duration`=? where `idx`=?";
    sql = mysql.format(sql, [
        updateTrip.name,
        updateTrip.country,
        updateTrip.destinationid,
        updateTrip.coverimage,
        updateTrip.detail,
        updateTrip.price,
        updateTrip.duration,
        id,
    ]);
    conn.query(sql, (err, result) => {
        if (err) throw err;
        res.status(201).json({ affected_row: result.affectedRows });
    });
});