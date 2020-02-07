/** ***********************************************************************
*
* Veracity Technology Consultants CONFIDENTIAL
* __________________
*
*  2019 Veracity Technology Consultants
*  All Rights Reserved.
*
* NOTICE:  All information contained herein is, and remains
* the property of Veracity Technology Consultants and its suppliers,
* if any.  The intellectual and technical concepts contained
* herein are proprietary to Veracity Technology Consultants
* and its suppliers and may be covered by U.S. and Foreign Patents,
* patents in process, and are protected by trade secret or copyright law.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Veracity Technology Consultants.
*/
const express = require('express');
const router = express.Router();
const models = require('../ODM/models');

async function populateOrg(req, res, next) {
    const org = await models.organization.findOne({ uuid: req.params.org });
    if (!org) {
        return res.status(404).send();
    }
    req.org = org;
    next();
}

async function populateProfile(req, res, next) {
    if (!req.org) return res.status(404).send();
    const profile = await models.profile.findOne({ uuid: req.params.profile });
    if (!profile) {
        return res.status(404).send();
    }
    req.profile = profile;
    next();
}

async function populateTemplate(req, res, next) {
    if (!req.org) return res.status(404).send();
    if (!req.profile) return res.status(404).send();

    const template = await models.template.findOne({ uuid: req.params.template });
    if (!template) {
        return res.status(404).send();
    }
    req.template = template;
    next();
}

async function populatePattern(req, res, next) {
    if (!req.org) return res.status(404).send();
    if (!req.profile) return res.status(404).send();

    const pattern = await models.pattern.findOne({ uuid: req.params.pattern });
    if (!pattern) {
        return res.status(404).send();
    }
    req.pattern = pattern;
    next();
}

async function populateConcept(req, res, next) {
    if (!req.org) return res.status(404).send();
    if (!req.profile) return res.status(404).send();

    const concept = await models.concept.findOne({ uuid: req.params.concept });
    if (!concept) {
        return res.status(404).send();
    }
    req.concept = concept;
    next();
}


router.get('/org/:org', populateOrg, (req, res, next) => {
    res.send({
        success: true,
        organization: req.org,
    });
});

router.get('/org', async (req, res, next) => {
    const orgs = await models.organization.find({});
    res.send({
        success: true,
        organizations: orgs,
    });
});

router.post('/org/:org', populateOrg, async (req, res, next) => {
    Object.assign(req.org, req.body);
    await req.org.save();
    res.send({
        success: true,
        organization: req.org,
    });
});

router.put('/org', async (req, res, next) => {
    req.org = new models.organization();
    req.org.uuid = require('uuid').v4();
    Object.assign(req.org, req.body);
    await req.org.save();
    res.send({
        success: true,
        organization: req.org,
    });
});

router.delete('/org/:org', populateOrg, async (req, res, next) => {
    await req.org.remove();
    res.send({
        success: true,
    });
});





router.get('/org/:org/profile/:profile', populateOrg, populateProfile, (req, res, next) => {
    res.send({
        success: true,
        profile: req.profile,
    });
});

router.get('/org/:org/profile/', populateOrg, async (req, res, next) => {
    const profiles = await models.profile.find({ organization: req.org.uuid });
    console.log('found ', profiles, ' for uuid ', req.org.uuid);
    res.send({
        success: true,
        profiles: profiles,
    });
});

router.post('/org/:org/profile/:profile', populateOrg, populateProfile, async (req, res, next) => {
    Object.assign(req.profile, req.body);
    await req.profile.save();
    res.send({
        success: true,
        profile: req.profile,
    });
});

router.put('/org/:org/profile/', populateOrg, async(req, res, next) => {
    req.profile = new models.profile();
    req.profile.uuid = require('uuid').v4();
    Object.assign(req.profile, req.body);
    req.profile.organization = req.org.uuid;
    await req.profile.save();
    res.send({
        success: true,
        profile: req.profile,
    });
});

router.delete('/org/:org/profile/:profile', populateOrg, populateProfile, async (req, res, next) => {
    await req.profile.remove();
    res.send({
        success: true,
    });
});


router.get('/org/:org/profile/:profile/concept/', populateOrg, populateProfile, async (req, res, next) => {
    const all = [];
    const ids = {};
    for (const i of req.profile.concepts) {
        const t = await models.concept.findOne({ uuid: i });
        ids[i] = t.toObject();
        ids[i].fromTemplate = 0;
    }
    // Merge in the
    for (const i of req.profile.templates) {
        const template = await models.template.findOne({ uuid: i });
        for (const j of template.concepts) {
            const t = await models.concept.findOne({ uuid: j });

            if (!ids[j]) {
                ids[j] = t.toObject();
                ids[j].fromTemplate = 0;
            }
            ids[j].fromTemplate++;
        }
    }
    for (const i in ids) { all.push(ids[i]); }
    res.send({
        success: true,
        concepts: all,
    });
});


router.get('/org/:org/profile/:profile/concept/:concept', populateOrg, populateProfile, populateConcept, (req, res, next) => {
    res.send({
        success: true,
        concept: req.concept,
    });
});

router.post('/org/:org/profile/:profile/concept/:concept', populateOrg, populateProfile, populateConcept, async (req, res, next) => {
    Object.assign(req.concept, req.body);
    await req.concept.save();
    res.send({
        success: true,
        concept: req.concept,
    });
});

router.put('/org/:org/profile/:profile/concept', populateOrg, populateProfile, async (req, res, next) => {
    req.concept = new models.concept();
    req.concept.uuid = require('uuid').v4();
    req.concept.parentProfile = {
        uuid: req.profile.uuid,
        name: req.profile.name,
    };
    req.concept.createdOn = new Date();
    req.concept.updatedOn = new Date();

    Object.assign(req.concept, req.body);
    await req.concept.save();
    req.profile.concepts.push(req.concept.uuid);
    await req.profile.save();
    res.status(200).send({
        success: true,
        concept: req.concept,
    });
});

router.delete('/org/:org/profile/:profile/concept/:concept', populateOrg, populateProfile, populateConcept, async (req, res, next) => {
    req.profile.concepts = req.profile.concepts.filter(i => i !== req.params.concept);
    await req.profile.save();
    res.send({
        success: true,
    });
});









router.get('/org/:org/profile/:profile/template/', populateOrg, populateProfile, async (req, res, next) => {
    const all = [];
    for (const i of req.profile.templates) {
        const t = await models.template.findOne({ uuid: i });
        all.push(t);
    }

    res.send({
        success: true,
        templates: all,
    });
});

router.get('/org/:org/profile/:profile/template/:template', populateOrg, populateProfile, populateTemplate, (req, res, next) => {
    res.send({
        success: true,
        template: req.template,
    });
});

router.post('/org/:org/profile/:profile/template/:template', populateOrg, populateProfile, populateTemplate, async (req, res, next) => {
    Object.assign(req.template, req.body);
    req.template.concepts = [...new Set(req.template.concepts)];
    await req.template.save();
    res.send({
        success: true,
        template: req.template,
    });
});

router.put('/org/:org/profile/:profile/template', populateOrg, populateProfile, async (req, res, next) => {
    if (req.body.uuid) {
        const existing = await models.template.findOne({ uuid: req.body.uuid });
        if (!existing) return res.status(400).send("uuid is present, but can't find tempalte");
        req.template = existing;
    } else {
        req.template = new models.template();
        req.template.uuid = require('uuid').v4();
        Object.assign(req.template, req.body);
        req.template.concepts = [...new Set(req.template.concepts)];
        await req.template.save();
    }
    if (req.profile.templates) { req.profile.templates.push(req.template.uuid); } else { req.org.templates = [req.template.uuid]; }
    req.profile.templates = [...new Set(req.profile.templates)];
    await req.profile.save();
    res.send({
        success: true,
        template: req.template,
    });
});

// Note- this removes from the profile. Check /tempatles to delete
router.delete('/org/:org/profile/:profile/template/:template', populateOrg, populateProfile, populateTemplate, async (req, res, next) => {
    for (const i of req.profile.templates) {
        if (i === req.params.template) {
            req.profile.templates.splice(i, 1);
        }
    }
    await req.profile.save();
    res.send({
        success: true,
    });
});


router.get('/org/:org/profile/:profile/pattern/', populateOrg, populateProfile, async (req, res, next) => {
    const all = [];
    for (const i of req.profile.patterns) {
        const t = await models.pattern.findOne({ uuid: i });
        all.push(t);
    }
    res.send({
        success: true,
        pattern: all,
    });
});

router.get('/org/:org/profile/:profile/pattern/:pattern', populateOrg, populateProfile, populatePattern, (req, res, next) => {
    res.send({
        success: true,
        pattern: req.pattern,
    });
});

router.post('/org/:org/profile/:profile/pattern/:pattern', populateOrg, populateProfile, populatePattern, async (req, res, next) => {
    Object.assign(req.pattern, req.body);
    await req.pattern.save();
    res.send({
        success: true,
        pattern: req.pattern,
    });
});

router.put('/org/:org/profile/:profile/pattern', populateOrg, populateProfile, async (req, res, next) => {
    req.pattern = new models.pattern();
    req.pattern.uuid = require('uuid').v4();
    Object.assign(req.pattern, req.body);
    await req.pattern.save();
    req.org.patterns.push(req.pattern.uuid);
    await req.org.save();
    res.send({
        success: true,
        pattern: req.pattern,
    });
});

router.delete('/org/:org/profile/:profile/pattern/:pattern', populateOrg, populateProfile, populatePattern, async (req, res, next) => {
    await req.pattern.remove();
    res.send({
        success: true,
    });
});

router.get('/template', async (req, res, next) => {
    const search = req.query.search;
    let query = {};
    if (search) {
        query = {
            $or: [
                { name: new RegExp(search) },
                { description: new RegExp(search) },
                { uuid: search },
                { iri: search },
            ],
        };
    }
    const results = await models.template.find(query);
    res.send({
        success: true,
        templates: results,
    });
});


router.get('/concept', async (req, res, next) => {
    const search = req.query.search;
    let query = {};
    if (search) {
        query = {
            $or: [
                { name: new RegExp(search) },
                { description: new RegExp(search) },
                { uuid: search },
                { iri: search },
            ],
        };
    }
    const results = await models.concept.find(query);
    res.send({
        success: true,
        concepts: results,
    });
});
module.exports = router;
