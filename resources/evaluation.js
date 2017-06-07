/**
 * All API calls for evaluation.
 *
 * Created by rickv, maurice_2 on 15-5-2017.
 */
router.get('', function(req, res){
    // TODO token
    var user_id = req.body.userid;

    // TODO token check
    var query = 'SELECT * FROM evaluation WHERE user_id = ' + user_id;

    connection.query(query, function (err, evaluation) {
        if (err) {
            console.log(err.message);
            // utils.error(409, 'Already exists', res);
            res.status(404).send("Cannot find evaluation");
            return;
        }

        res.status(200).json(evaluation);
    })
});

router.post('/add', function (req, res) {
    console.log("hier komt hij");
    var user_id = req.decoded.userId;
    var image_url = JSON.parse(req.body.image_url);

    var query = 'INSERT INTO evaluation (user_id, image_url) VALUES ("' + user_id + '", "' + image_url + '");';

    connection.query(query, function (err) {
        if (err) {
            console.log(err.message);
            // utils.error(409, 'Already exists', res);
            res.status(400).send("Foute aanvraag");
            return;
        }

        res.status(201).send("Evaluatie gecreëerd");
    })
});