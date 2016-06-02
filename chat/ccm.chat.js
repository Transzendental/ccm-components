ccm.component( {

  name: 'userStory',

  config: {

    html:  [ ccm.store, { local: 'templates.json' } ],
    key:   'userStorys',
    store: [ ccm.store, { url: 'ws://ccm2.inf.h-brs.de/index.js', store: 'userStory' } ],
    style: [ ccm.load, 'style.css' ],
    user:  [ ccm.instance, 'https://kaul.inf.h-brs.de/ccm/components/user2.js' ]

  },

  Instance: function () {

    var self = this;

    self.init = function ( callback ) {

      self.store.onChange = function () { self.render(); };

      callback();

    };

    self.render = function ( callback ) {

      var element = ccm.helper.element( self );

      self.store.get( self.key, function ( dataset ) {

        if ( dataset === null )
          self.store.set( { key: self.key, storys: [] }, proceed );
        else
          proceed( dataset );

        function proceed( dataset ) {

          element.html( ccm.helper.html( self.html.get( 'main' ) ) );

          var usDiv = ccm.helper.find( self, '.userStorys' );

          for ( var i = 0; i < dataset.storys.length; i++ ) {

            var us = dataset.storys[ i ];

            usDiv.append( ccm.helper.html( self.html.get( 'userStory' ), {

              name: ccm.helper.val( us.name ),
              text: ccm.helper.val( us.text ),
              aufwand: ccm.helper.val( us.aufwand )

            } ) );

          }

          usDiv.append( ccm.helper.html( self.html.get( 'input' ), { onsubmit: function () {

            var value = ccm.helper.val( ccm.helper.find( self, 'input' ).val() ).trim();

            if ( value === '' ) return;

            self.user.login( function () {

              dataset.storys.push( { user: self.user.data().key, text: value } );

              self.store.set( dataset, function () { self.render(); } );

            } );

            return false;

          } } ) );

          if ( callback ) callback();

        }

      } );

    };

  }

} );