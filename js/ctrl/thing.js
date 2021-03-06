var _thing= ['$scope','$routeParams','$location','$sce','db','growl',
function ($scope,$routeParams,$location,$sce,db,growl)
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
          $scope.readFieldNames();
          $scope.createFields();
        }

        $scope.$apply(); // altrimenti niente growl: @TODO: fix angular-pouchdb
   });   

   $scope.output= function ()
   {
      return _.omit($scope.thing,['thumbnail']);
   };

   $scope.readFieldNames= function ()
   {
      $scope.fieldNames= _.keys(_.omit($scope.thing,['_id','_rev','name','thumbnail'])).join(' ');
   };

   $scope.createFields= function ()
   {
      var fields= _.without($scope.fieldNames.split(/\s+/),'');

      $scope.fields= _.filter($scope.fields,function (f) { return _.contains(fields,f.name); });

      _(fields).each(function (name)
      {
          if (!_.contains(_.pluck($scope.fields,'name'),name))
            $scope.fields.push({ name: name,
                                 type: fieldType(name),
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
        return isFile(val[0]);
      else
      if (val&&typeof val=='object')
      {
        var keys= _.keys(val);
        return _.difference(['name','type','size'],keys).length==0;
      }
      else
        return false;
   };

   var isThing= $scope.isThing= function (val)
   {
      if (isArray(val)&&val.length)
        return isThing(val[0]);
      else
      if (val&&typeof val=='object')
      {
        var keys= _.keys(val);
        return _.difference(['_id','_rev'],keys).length==0;
      }
      else
        return false;
   };

   var isMarkdown= $scope.isMarkdown= function (val)
   {
      if (isArray(val)&&val.length)
        return isMarkdown(val[0]);
      else
      if (val&&typeof val=='string')
      {
        return val.indexOf('\n')>-1||markdown.toHTML(val)!='<p>'+val+'</p>';
      }
      else
        return false;
   };

   var isDate= $scope.isDate= function (val)
   {
      if (isArray(val)&&val.length)
        return isDate(val[0]);
      else
      if (val&&typeof val=='string')
      {
        return val.indexOf('-')>0&&!isNaN((new Date(val)).getSeconds());
      }
      else
        return false;
   };

   var isNumber= $scope.isNumber= function (val)
   {
      if (isArray(val)&&val.length)
        return isNumber(val[0]);
      else
      if (val)
      {
        return typeof val=='number';
      }
      else
        return false;
   };

   var empty= $scope.empty= function (field)
   {
      var val= $scope.thing[field.name];

      if (isThing(val))
        return { _id: '', _rev: '', name: '' };
      else
        return '';
   };

   $scope.fieldTemplate= function (field)
   {
      if (isFile($scope.thing[field.name])||field.type=='file')
        return '/views/fields/file.html';
      else
      if (isThing($scope.thing[field.name])||field.type=='thing')
        return '/views/fields/thing.html';
      else
      if (isMarkdown($scope.thing[field.name])||field.type=='markdown')
        return '/views/fields/markdown.html';
      else
      if (isDate($scope.thing[field.name])||field.type=='date')
        return '/views/fields/date.html';
      else
      if (isNumber($scope.thing[field.name])||field.type=='number')
        return '/views/fields/number.html';
      else
        return '/views/fields/text.html';
   };

   var fieldType= $scope.fieldType= function (name)
   {
      var val= $scope.thing[name];

      if (isFile(val))
        return 'file';
      else
      if (isThing(val))
        return 'thing';
      else
      if (isMarkdown(val))
        return 'markdown';
      else
      if (isDate(val))
        return 'date';
      else
      if (isNumber(val))
        return 'number';
      else
        return 'text';
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

      if (isArray(val))
        val.push(empty(field));     
      else
        $scope.thing[field.name]= [val,empty(field)];
   };

   $scope.rmValue= function (field,$index)
   {
      var val= $scope.thing[field.name];

      if (val.splice)
      {
          val.splice($index,1);

          if (val.length==1) // siamo sicuri?
            $scope.thing[field.name]= val[0]; 
      }
      else
      {
          $scope.thing= _.omit($scope.thing,[field.name]); 
          $scope.readFieldNames();
          $scope.createFields();
      }
   };

   $scope.toThing= function (field)
   {
      field.type= 'thing';
   };

   $scope.toMarkdown= function (field)
   {
      field.type= 'markdown';
   };

   $scope.toDate= function (field)
   {
      field.type= 'date';
   };

   $scope.toNumber= function (field)
   {
      field.type= 'number';

      var val= $scope.thing[field.name];

      if (isArray(val))
        val.forEach(function (v,i)
        {
          val[i]= +v;
        });
      else
        $scope.thing[field.name]= +val;
   };

   $scope.toText= function (field)
   {
      field.type= 'text';

      var val= $scope.thing[field.name];

      if (isArray(val))
        val.forEach(function (v,i)
        {
          val[i]= ''+v;
        });
      else
        $scope.thing[field.name]= ''+val;
   };

   $scope.md2HTML= function (val)
   {
      return $sce.trustAsHtml(markdown.toHTML(val));
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
              var f= _.pick(x,['name','type','size']),
                  reader = new FileReader();
                 
              reader.onload = function(e)
              {
                  f.url= reader.result;
                  console.log(f.url);
                  $scope.$apply();
              };

              reader.readAsDataURL(x);

              return f;
           };

       if (isArray($scope.thing[$this.data('field-name')]))
       {
           if (fileInput.files.length==1)
             $scope.thing[$this.data('field-name')][$this.data('index')]= tofile(fileInput.files[0]);
           else
           {
             var args= [$this.data('index'),1];
             args.push.apply(args,_.collect(fileInput.files,tofile));
             var val= $scope.thing[$this.data('field-name')];
             val.splice.apply(val,args);
           }
       }
       else
       {
           if (fileInput.files.length==1)
             $scope.thing[$this.data('field-name')]= tofile(fileInput.files[0]);
           else
             $scope.thing[$this.data('field-name')]= _.collect(fileInput.files,tofile);
       }

       $scope.$apply();
   });
}];
