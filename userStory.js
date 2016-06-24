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

        self.init = function (callback) {

            self.store.onChange = function () {
                self.render();
            };

            callback();

        };

        self.render = function (callback) {

            var element = ccm.helper.element(self);

            element.html(ccm.helper.html(self.html.get('main')));

            self.store.get(self.key, function (dataset) {

                if (dataset === null)
                    self.store.set({key: self.key, storys: []}, proceed);
                else
                    proceed(dataset);

                function proceed(dataset) {
                    var usDiv = ccm.helper.find(self, '.userStorys');

                    usDiv.append(ccm.helper.html(self.html.get('usTable')));

                    var usTable = ccm.helper.find(self, '.usTable');

                    usTable.append(ccm.helper.html(self.html.get('usTableHeader')));

                    for (var i = 0; i < dataset.storys.length; i++) {
                        var us = dataset.storys[i];
                        usTable.append(ccm.helper.html(self.html.get('userStory'), {
                            name: ccm.helper.val(us.name),
                            text: ccm.helper.val(us.text),
                            aufwand: ccm.helper.val(us.aufwand),
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

                    element.append(ccm.helper.html(self.html.get('input'), {
                        onsubmit: function () {

                            var iName = ccm.helper.val(ccm.helper.find(self, '.inputName').val().trim());
                            var iText = ccm.helper.val(ccm.helper.find(self, '.inputText').val().trim());
                            var iAufwand = ccm.helper.val(ccm.helper.find(self, '.inputAufwand').val().trim());

                            if (iName === '') return;

                            self.user.login(function () {

                                dataset.storys.push({
                                    name: iName,
                                    text: iText,
                                    aufwand: iAufwand,
                                    user: self.user.data().key,
                                    done: false
                                });

                                saveDataset(dataset);
                            });

                            return false;
                        }
                    }));

                    if (callback) callback();
                }

                $("th").click(function () {
                    dataset.storys.sort( function (a,b) {
                        return a.name > b.name ? 1 : b.name > a.name ? -1 : 0;
                    });

                    self.render();
                });
            })

        }

        function saveDataset(dataset) {
            self.store.set(dataset, function () {
                self.render();
            });
        }
    }
});