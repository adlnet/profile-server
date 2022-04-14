const iri = require('./iri');
router.use('/api/iri', iri)

// set up GET request router when searching by IRI
router.get('/api/iri/:iri', (req, res) => {
    // store the iri from url as a string
    let iri = String(req.params.iri);
    console.log(iri)

    /*  store our queries as an array to run them simultaneously in our promise function.
        each query will go through each model and find the matching IRI in each model.
        may need to implement a different function rather than findOne(), as the iri key
        is not valid identifier
    */
    var queries = [
        // search through concepts
        models.concept.findOne({ iri: iri }),
        // search through profiles
        models.profile.findOne({ iri: iri }),
        // search through patterns
        models.pattern.findOne({ iri: iri }),
        // search through statement templates
        models.templates.findOne({ iri: iri }),
    ];
    // debugger
  
    Promise.allSettled(queries) // Promise.all() will immediately reject if any promises fail, so we use .allSettled() instead
    .then(results => {
    // if the results are null -- AKA can't find the IRI -- return an error
        if (!results[0] && !results[1] && !results[2] && !results[3]) {
            console.log("No matching IRIs");
            return; // will probably want to return a 500 status here

    // else if there is a result, parse the results array for the non-empty value and redirect it 
        } else {
            console.log(results)
            for (let i = 0; i < results.length; ++i) {
                if (result[i] != null) {
                    if (results[i].uuid.type == "concept") {
                        res.redirect(301, `/concept/${results.uuid}`)
                    } else if (results[i].uuid.type == "pattern") {
                        res.redirect(301, `/pattern/${results.uuid}`)
                    } else if (results[i].uuid.type == "template") {
                        res.redirect(301, `/template/${results.uuid}`)
                    } else if (results[i].uuid.type == "profile") {
                        res.redirect(301, `/profile/${results.uuid}`)
                    }
                    return
                }
            }
            res.redirect(400, '/')
        }

    // store the result of the profile & identifier so we can redirect to the appropriate url
        // let profile = results[0].profileID
        // let uniqueID = results[0].uri


        // here we can either render the json (WiP), or just redirect to the appropriate page of the object
        // res.render('index.html', { data: {
        //     status: 302,
        //     result: result,
        //     message: "Working"
        // } });
    })
    .catch(err => {
    //
        console.log("Error in getting queries", err);
        res.status(500).send({
          success: false,
          err: err
        })
    });
  });