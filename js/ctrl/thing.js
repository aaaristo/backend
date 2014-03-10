var _thing= ['$scope','$routeParams','$location','db','growl',
function ($scope,$routeParams,$location,db,growl)
{
   $('#name').focus(); 

   $('#fields').keypress(function(e)
   {
      if (e.which == 13)
        $scope.$apply($scope.createFields);
   });

   $scope.fields= [];

   db.get($routeParams.id, function(err, thing)
   { 
        if (err)
        {
          if (err.status==404)
            $scope.thing= { _id: $routeParams.id };
          else
            growl.addErrorMessage('woops, cannot read this thing: '+err.message);
        }
        else
        {
          $scope.thing= thing;
          $scope.fieldNames= _.keys(_.omit($scope.thing,['_id','_rev','name','thumbnail'])).join(' ');
          $scope.createFields();
        }

        $scope.$apply(); // altrimenti niente growl: @TODO: fix angular-pouchdb
   });   

   $scope.createFields= function ()
   {
      var fields= $scope.fieldNames.split(/\s+/);

      $scope.fields= _.filter($scope.fields,function (f) { return _.contains(fields,f.name); });

      _(fields).each(function (name)
      {
          if (!_.contains(_.pluck($scope.fields,'name'),name))
            $scope.fields.push({ name: name,
                                 type: 'text',
                                label: name.substring(0,1).toUpperCase()
                                      +name.substring(1).toLowerCase() });
      });
   };

   $scope.save= function (selse)
   {
      $scope.saving= true;

      db.put($scope.thing,
      function (err, response)
      {
        $scope.saving= false;

        if (err)
          growl.addErrorMessage('woops, cannot save this thing: '+err.message);
        else
        {
          growl.addSuccessMessage($scope.thing.name+' saved!');

          if (selse)
            $location.path('thing/'+UUIDjs.create(4));
          else
            $location.path('things');
          
        }

        $scope.$apply(); // altrimenti niente growl: @TODO: fix angular-pouchdb
      });

   };

   $scope.trackValue= function (field,$index)
   {
      return field.name+'-'+$index;
   };

   var isArray= $scope.isArray= function (val)
   {
      return Array.isArray(val);
   };

   var isFile= $scope.isFile= function (val)
   {
      if (isArray(val)&&val.length)
        return !!val[0]._file;
      else
        return !!val._file;
   };

   $scope.values= function (x)
   {
       if (isArray(x))
         return x;
       else
         return [x];
   };

   $scope.addValue= function (field)
   {
      var val= $scope.thing[field.name];

      if ($scope.isArray(val))
        val.push('');     
      else
        $scope.thing[field.name]= [val,''];
   };

   $scope.rmValue= function (field,$index)
   {
      var val= $scope.thing[field.name];
      val.splice($index,1);

      if (val.length==1) // siamo sicuri?
        $scope.thing[field.name]= val[0]; 
   };

   $('#thumbnailfile').change(function (e)
   {
      var fileInput= $(this)[0],
          file = fileInput.files[0];

      if (file.type.match(/image.*/))
      {
         var reader = new FileReader();
         
         reader.onload = function(e)
         {
             $('#thumbnailimg').attr('src',$scope.thing.thumbnail= reader.result);
             $scope.$apply();
         }

         reader.readAsDataURL(file);
      }
      else
         growl.addErrorMessage('woops, this does not looks like an image!');

      $scope.$apply();
   });

   $('form').on('change','.attach-file',function (e)
   {
       var $this= $(this), fileInput= $this[0],
           tofile= function (x)
           {
              return _.extend(_.pick(x,['name','type','size']), { _file: true });
           };

       if (fileInput.files.length==1)
         $scope.thing[$this.data('field-name')]= tofile(fileInput.files[0]);
       else
         $scope.thing[$this.data('field-name')]= _.collect(fileInput.files,tofile);

       $scope.$apply();
   });
}];
