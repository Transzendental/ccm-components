ccm.component({

    name: 'userStory',

    config: {

        html: [ccm.store, {local: 'templates.json'}],
        key: 'userStory',
        store: [ccm.store, {url: 'ws://ccm2.inf.h-brs.de/index.js', store: 'userStory'}],
        style: [ccm.load, 'style.css'],
        user: [ccm.instance, 'https://kaul.inf.h-brs.de/ccm/components/user2.js']
    },

    Instance: function () {

        var self = this;
        var sortAsc;

        self.init = function (callback) {
            self.store.onChange = function () {
                self.render();
            };

            sortAsc = 1;

            callback();

        };

        self.render = function (callback) {
            //self.store.del("userStory");
            var element = ccm.helper.element(self);

            element.html(ccm.helper.html(self.html.get('main')));

            self.store.get(self.key, function (dataset) {

                if (dataset === null)
                    self.store.set({key: self.key, storys: [], projects: []}, build);
                else
                    build(dataset);

                //builds the page
                function build(dataset) {
                    console.log(dataset);

                    var usDiv = ccm.helper.find(self, '.userStorys');
                    usDiv.append(ccm.helper.html(self.html.get('usTable')));

                    var usTable = ccm.helper.find(self, '.usTable');
                    usTable.append(ccm.helper.html(self.html.get('usTableHeader')));

                    //populate the user story table
                    for (var i = 0; i < dataset.storys.length; i++) {
                        var us = dataset.storys[i];
                        usTable.append(ccm.helper.html(self.html.get('userStory'), {
                            name: ccm.helper.val(us.name),
                            text: ccm.helper.val(us.text),
                            cost: ccm.helper.val(us.cost),
                            project: ccm.helper.val(us.project),
                            user: ccm.helper.val(us.user),
                            id: i,
                            clickDone: function () {
                                $(this).parent().addClass("done");
                                dataset.storys[$(this).parent().attr("id")].done = !dataset.storys[$(this).parent().attr("id")].done;
                                saveDataset(dataset);
                            },
                            clickDelete: function () {
                                dataset.storys.splice($(this).parent().attr("id"), 1);
                                saveDataset(dataset);
                            }
                        }));

                        if (us.done) {
                            $(".userStory#" + i).addClass("done");
                        }
                    }

                    //Input for new UserStors and Projects
                    element.append(ccm.helper.html(self.html.get('input'), {
                        usSubmit: function () {

                            var iName = ccm.helper.val(ccm.helper.find(self, '#usName').val().trim());
                            var iText = ccm.helper.val(ccm.helper.find(self, '#usText').val().trim());
                            var iProj = ccm.helper.val(ccm.helper.find(self, '#usProj').val().trim());
                            var iCost = ccm.helper.val(ccm.helper.find(self, '#usCost').val().trim());

                            if (iName === '') return;

                            self.user.login(function () {

                                dataset.storys.push({
                                    name: iName,
                                    text: iText,
                                    cost: iCost,
                                    project: iProj,
                                    user: self.user.data().key,
                                    done: false
                                });

                                saveDataset(dataset);
                            });

                            return false;
                        },
                        
                        projSubmit: function () {

                            var iName = ccm.helper.val(ccm.helper.find(self, '#projName').val().trim());
                            var iText = ccm.helper.val(ccm.helper.find(self, '#projText').val().trim());

                            if (iName === '') return;

                            dataset.projects.push({
                                name: iName,
                                text: iText
                            });

                            saveDataset(dataset);

                            return false;
                        }
                    }));

                    //Fill project DropDown input
                    var projects = ccm.helper.find(self, '#usProj');
                    for (var i = 0; i < dataset.projects.length; i++) {

                        projects.append("<option>" + dataset.projects[i].name + "</option>");
                    }


                    if(callback)callback();

                }

                //Allows sorting doubleclick should sort in different order
                ccm.helper.find(self, 'th').click(function () {
                    var comperartor;
                    switch ($(this).attr("id")) {
                        case "name":
                            comperartor = function (a, b) {
                                return a.name > b.name ? 1 * sortAsc : b.name > a.name ? -1 * sortAsc : 0;
                            }
                            break;
                        case "descr":
                            comperartor = function (a, b) {
                                return a.text > b.text ? 1 * sortAsc : b.text > a.text ? -1 * sortAsc : 0;
                            }
                            break;
                        case "user":
                            comperartor = function (a, b) {
                                return a.user > b.user ? 1 * sortAsc : b.user > a.user ? -1 * sortAsc : 0;
                            }
                            break;
                    }

                    dataset.storys.sort(comperartor);
                    sortAsc *= -1;
                    self.render();
                });


            });

            function saveDataset(dataset) {
                self.store.set(dataset, function () {
                    self.render();
                });
            }
        };
    }
});