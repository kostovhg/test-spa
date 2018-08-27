$(() => {
    const [
        layout,
        nav, footer,
        about, 
        experience, experienceRecord,
        education, edu, eduTab,
        skills, skill,
        projects, project,
        login, register, contact
    ] = [
        './templates/layout.hbs',
        './templates/common/nav.hbs', './templates/common/footer.hbs',
        './templates/main/about.hbs', 
        './templates/main/experience.hbs', './templates/partials/experienceRecord.hbs',
        './templates/main/education.hbs', './templates/partials/edu.hbs', './templates/partials/eduTab.hbs',
        './templates/main/skills.hbs', './templates/partials/skill.hbs',
        './templates/main/projects.hbs', './templates/partials/project.hbs',
        './templates/forms/login.hgs', './templates/forms/register.hbs', './templates/forms/contact.hbs'
    ];

    const ROUTES = {
        index: 'index.html',
        about: '#/about',
        experience: "#/experience",
        skills: "#/skills",
        education: "#/education",
        projects: "#/projects",
        contact: "#/contact",
    };

    function getLang() {
        return "language/" + (sessionStorage.getItem('currentLanguage') || "en") + ".json";
    }

    const app = Sammy('#layout', function () {

        let appCtx = this;

        this.use('Handlebars', 'hbs');

        this.helpers({
            switchLanguage(lang) {
            },
            getColor: function(level){
                let l = Number(level);
                let bgColor;
                if(l < 25){
                    bgColor = 'danger';
                } else if(l < 50){
                    bgColor = 'warning';
                } else if (l < 75){
                    bgColor = 'info';
                } else {
                    bgColor = 'success';
                }
                return bgColor;
            }
        })

        this.before({
            except: {
                path: "/index.html#/lang"
            }
        }, function () {
            //console.log('a before');
        });

        this.helpers({
            loadCommon: function (section, addPartials) {
                let ctx = this;
                let partials = {nav};
                if(addPartials) {
                    for (let key of Object.keys(addPartials)) {
                        partials[key] = addPartials[key];    
                    }
                }
                return $.getJSON(getLang(),
                        function (r) {
                            ctx.params.currentLanguage = r.currentLanguage;
                            ctx.params.nav = r.nav;
                            ctx.params[section] = r[section] || true;
                        })
                    .then(function () {
                        return ctx.loadPartials(partials);
                    }).fail(function () {
                        console.log('There is problem with loading data.')
                        return false;
                    })
            }
        })

        this.get(ROUTES.index, function () {
            this.redirect(ROUTES.about)
        })

        this.get(ROUTES.about, function () {
            let ctx = this;
            this.loadCommon('about')
                .then(function () {
                    this.partial(layout, ctx.params, {
                        content: about
                    });
                });
        });

        this.get(ROUTES.experience, function () {
            let ctx = this;
            this.loadCommon('experience', {experienceRecord})
            .then(function(){
                console.log(ctx);
                this.partial(layout, ctx.params, {
                    content: experience
                })
            })
        });

        this.get(ROUTES.skills, function () {
            let ctx = this;
            this.loadCommon('skills', {skill})
            .then(function(){
                console.log(ctx);
                ctx.params.skills.map(s => s["bootstrap-color"] = ctx.getColor(s.level));
                this.partial(layout, ctx.params, {
                    content: skills
                })
            })
        });

        this.get(ROUTES.education, function () {
            let ctx = this;
            this.loadCommon('education', {edu, eduTab})
            .then(function(){
                console.log(ctx);
                this.partial(layout, ctx.params, {
                    content: education
                })
            })
        });

        this.get(ROUTES.contact, function () {
            let ctx = this;
            this.loadCommon('contact', {})
            .then(function(){
                console.log(ctx);
                this.partial(layout, ctx.params, {
                    content: contact
                })
            })
        });


        this.get("#/:lang", function () {
            console.log(this);
            if (this.params.lang !== sessionStorage.getItem('currentLanguage')) {
                sessionStorage.setItem('currentLanguage', this.params.lang);
                this.redirect(ROUTES.about);
            } else {
                console.log('The language is the same')
                this.redirect(ROUTES.about);
            }
        })

    
    });

    app.run('index.html');
});