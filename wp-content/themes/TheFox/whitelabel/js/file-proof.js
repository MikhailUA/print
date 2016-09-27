// NOTE Actual initialization is at the bottom of the file.
// TODO This has become one very big class, which should be split into several
// smaller ones

// Vars starting with an underscore are supposed to be contained within the
// scope of a single function at a time.
var FileProofer,
  file_proofers = [],
  products_requiring_upload = [],
  _$obj, // Placeholder for a jQuery object
  _obj, // Placeholder for an object
  _ajax_request, // Placeholder for an ajax request
  _i, // Placeholder for an int
  _j, // Placeholder for a second iterator
  _s, // Placeholder for a string
  _s2, // Second placeholder for a string
  _s3, // Third placeholder for a string
  _val, // Placeholder for a val
  _a, // Placeholder for an array
  _c, // Placeholder for confirms

  // Placeholder for the other fieldset of the two fieldsetused in toggling
  // front and back:
  _$parent_fieldset,
  _$other_fieldset,

  // Vars from outside this scope:
  editor_translations,
  tmpl,
  product_copy,
  warning_messages,
  ChiliLib,
  status_codes,
  analytics,
  fixed_copy,
  HPLE_removeEditor,

  // Constants
  TYPE_NCI = 'new-cart-id',
  TYPE_ODI = 'order-detail-id',

  PDFT_ERROR_WRONG_PAGE_COUNT = 9007;



/**
 * Abstracts given param from the url.
 *
 * @param {string} name The name to get the value of
 * @param {string} url  Optional. The url to work on. If none provided, uses the
 *                      current url.
 *
 * @return {string}      The found value
 */
function getParameterByName (name, url) {
  var regex, results;

  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}



/**
 * One File Proofer corresponds to a single cart item. It can contain multiple
 * files, as some products use multiple files. It is responsible for all
 * communication to the actual proofing.
 *
 * @static
 *
 * @return {object} A new instance of self.
 */
FileProofer = (function () {
  /** @static */
  FileProofer.steps = {
    defaults: [
      'upload-files'
    ],
    with_chili: [
      'filecheck',
      'filecheck-result',
      'filecheck-failed',
      'wrong-number-of-pages'
    ]
  };

  FileProofer.$steps = [];
  FileProofer.validation_message_template = 'template-invalid';
  FileProofer.upload_error_template = 'template-error';
  FileProofer.retry_wait_time = 3000;
  FileProofer.max_retries = 20;
  FileProofer.full_filecheck_retries = 0;
  FileProofer.instances = [];
  FileProofer.language_map = {
    'nl': 'nl-NL',
    'en': 'en-US',
    'fr': 'fr-FR',
    'es': 'es-ES'
  };



  /** @instance */
  FileProofer.prototype.files = [];
  FileProofer.prototype.errors = [];
  FileProofer.prototype.warnings = [];
  FileProofer.prototype.uploads_in_progress = [];
  FileProofer.prototype.finished_uploads = [];
  FileProofer.prototype.profress_updater = null;
  FileProofer.prototype.progress_updater_running = false;
  FileProofer.prototype.stepActions = [];
  FileProofer.prototype.uses_chili_result = false;
  FileProofer.prototype.process_state = 'IDLE';
  FileProofer.prototype.proofing_result = {
    thumbs: []
  };



  /**
   * Initialize the html on self, which can be used as reference and jQuery
   * context by every instance of FileProofer. Also attach the closer.
   *
   * @static
   * @memberof FileProofer
   *
   * @param {object} $html The jQuery object of the current file proofer.
   *
   * @return {void}
   */
  FileProofer.init = function ($html) {
    FileProofer.$html = $html;
    FileProofer.$uploadform = $('.fileupload_dropzone', FileProofer.$html);
    FileProofer.cancelable_ajax_requests = [];
    FileProofer.uploadform_unattached = true;

    FileProofer.chili_lib = new ChiliLib();
    FileProofer.chili_lib.controller_name = 'chili';
    FileProofer.chili_lib.render_sidebar = true;
    FileProofer.chili_lib.$chili_builder_area =
      $('#builder_area, #pageContainer');
    FileProofer.chili_lib.chili_builder_sidebar_area =
      document.getElementById('builder_sidebar_area');
    FileProofer.chili_lib.$chili_builder_sidebar_area =
      $('#builder_sidebar_area');

    FileProofer.defaults = {
      current_step: FileProofer.steps.defaults[0],
      type: TYPE_ODI
    };

    for (_s in FileProofer.steps) {
      for (_i = 0; _i < FileProofer.steps[_s].length; _i++) {
        FileProofer.$steps[FileProofer.steps[_s][_i]] = $(
          '#proofer-step-' + FileProofer.steps[_s][_i],
          FileProofer.$html
        );
      }
    }
  };



  /**
   * Sets the state of the process to the passed type
   *
   * @instance
   * @memberof FileProofer
   *
   * @param {string} new_state The state to use
   *
   * @return {void}
   */
  FileProofer.prototype.setProcessStateTo = function (new_state) {
    if (new_state === this.process_state) {
      return false;
    }

    this.process_state = new_state;
  };



  /**
   * Constructor
   *
   * @param {object} options An opbject of options, looking somewhat like the
   *                         example below.
   *                         {
   *                           sku: 'xx-xx-xx',
   *                           identifier: 123456,
   *                           supplier_id: 12,
   *                           product_id: 12345,
   *                           copy: {
   *                             'one-string': 'abc',
   *                             'other-string': 'xyz',
   *                           },
   *                           type: 'new-cart-id'|'id-order-object'
   *                         }
   *
   * @static
   * @constructor
   * @memberof FileProofer
   *
   * @returns {void}
   */
  function FileProofer (options) {
    // Merge options with defaults
    _obj = $.extend({}, FileProofer.defaults, options);

    for (_s in _obj) {
      if (_obj.hasOwnProperty(_s)) {
        this[_s] = _obj[_s];
      }
    }

    this.getCPDFStatus();

    this.setAvailableSteps();

    this.gatherPreviousUploads();

    FileProofer.instances.push(this);
  }



  /**
   * Defines the available step for this instance.
   *
   * @return {void}
   */
  FileProofer.prototype.setAvailableSteps = function () {
    _a = FileProofer.steps.defaults;

    if (this.pdft_allowed) {
      _a = _a.concat(FileProofer.steps.with_chili);
    }

    this.available_steps = _a;
  };



  /**
   * Called when the filecheck step is loaded. Initializes the filecheck.
   *
   * @instance
   * @memberof FileProofer
   *
   * @param {object} _this Receive a reference to self, as this might be a
   * callback.
   *
   * @return {void}
   */
  FileProofer.prototype.stepActions['filecheck'] = function (_this) { // eslint-disable-line
  };



  /**
   * Called when the filecheck step is loaded. Initializes the filecheck.
   *
   * @instance
   * @memberof FileProofer
   *
   * @param {object} _this Receive a reference to self, as this might be a
   * callback.
   *
   * @return {void}
   */
  FileProofer.prototype.stepActions['filecheck-result'] = function (_this) { // eslint-disable-line
    if (_this.proofing_result === undefined) {
      return false;
    }

    _this.collectPreviews();
    // _this.unsetTheApprovedLabel();
  };



  /**
   * Uschecks all appearances of the checkbox used to indicate artwork approved
   *
   * @instance
   * @memberof FileProofer
   *
   * @return {void}
   */
  FileProofer.prototype.unsetTheApprovedLabel = function () {
    $('#approve-artworks', FileProofer.$html).attr('checked', false);
    $('.finish-proofer', FileProofer.$html).addClass('disabled');
  };



  /**
   * Collect the file results.
   *
   * @instance
   * @memberof FileProofer
   *
   * @return {[type]} [description]
   */
  FileProofer.prototype.collectPreviews = function () {
    var _this = this;

    _a = [];

    return this.getAttachementsStatus(function (result) {
      for (_i = 0; _i < result.data.files.length; _i++) {
        if (result.data.files[_i].indexOf('overlay') === -1) {
          continue;
        }

        _a.push({
          path: result.data.files[_i],
          previewtype: 'png'
        });
      }

      if (_a.length === 0) {
        for (_i = 0; _i < result.data.files.length; _i++) {

          _a.push({
            path: result.data.files[_i],
            previewtype: 'png'
          });
        }
      }


      FileProofer.hideLoadingOverlay();
      _this.setPreviewImages(_a, true);
      _this.showTheRightPreviews(_a.length);
    }, function (result, _this) {
      _this.changePreviewContainerToGotFiles();
    }, 3);
  };



  /**
   * Add the class to the container, and change the copy of the button
   *
   * @return {void}
   */
  FileProofer.prototype.changePreviewContainerToGotFiles = function () {
    if (this.$container.length > 0) {
      $('.fileproof-upload', this.$container).addClass('got-files');
      this.updateUploadButton(editor_translations.upload_new);
    }
  };



  /**
   * Depending on the length of the number of previews, show a different preview
   *
   * @instance
   * @memberof FileProofer
   *
   * @param {int} preview_count The number of previews found
   *
   * @return {void|function} Either nothing or a function that will go to the
   *                         error page
   */
  FileProofer.prototype.showTheRightPreviews = function (preview_count) {
    $('.proof-result', FileProofer.$html).hide();

    switch (preview_count) {
    case 1:
      $('#proof-result-single', FileProofer.$html).show();
      break;
    case 2:
      $('#proof-result-double', FileProofer.$html).show();
      break;
    default:
      console.log('Got either 0 or more then 2 results from a proofing that ' +
      'seemed to have succeeded at first. This indicates our js logic for ' +
      'handling a successfully proved order is incomplete.');
      return this.handleNegativeProofingResponse();
    }
  };



  /**
   * Get's the preview images and also converts their url when required.
   *
   * @todo Add preloader
   *
   * @instance
   * @memberof FileProofer
   *
   * @param {array}   images    The images
   * @param {boolean} skip_prep When true, some preparations are skipped.
   *
   * @return {void}
   */
  FileProofer.prototype.setPreviewImages = function (images, skip_prep) {
    var _this = this;

    $('.proof-result', FileProofer.$html).each(function (i, e) {
      $('.proof-result-white-box', $(e)).each(function (j, f) {
        if (images[j] === undefined) {
          return;
        }

        _s = images[j];
        if (images[j].path) {
          _s = _this.convertPreviewFilePathToUrl(
            images[j].path,
            j + 1,
            images[j].previewtype,
            !skip_prep
          )  + '?t=' + Date.now();
        }

        _this.setPreviewOnContainer(_s);
        $('a', f).attr('href', _s);
        $('a img', f).attr('src', _s);
      });
    });
  };



  /**
   * Converts a path to an url. Unfortunaltey we have to do this because of the
   * response we are getting from PDFT.
   *
   * @todo Should be no need for this at all.
   *
   * @instance
   * @memberof FileProofer
   *
   * @param {string} path              The path to convert.
   * @param {int}    page              The page number we're expecting to fetch.
   * @param {string} type              The type of file.
   * @param {bool}   add_page_and_type When true, the type is fixed to png and
   *                                   the expected pagenumber is passed as a
   *                                   zerofilled integer.
   *
   * @return {string} The converted. This is very deeply linked to the server
   * logic and therefor bad.
   */
  FileProofer.prototype.convertPreviewFilePathToUrl = function (
    path, page, type, add_page_and_type
  ) {
    // Strip everything before cache, up up to prestashop-web or production
    _s = path.replace(/^.+\/prestashop-web/,'');
    _s = _s.replace(/^.+\/production/,'');

    if (add_page_and_type) {
      // Strip file extention
      _s = _s.replace(/\.[^/.]+$/, '');

      // Append number. Slicing at the end is to ensure zerofill
      _s = _s + '_' + ('0000' + page).slice(page.toString().length);

      // Append file type
      _s + '.' + type.toLowerCase();
    }

    return _s;
  };



  /**
   * Attached the jQuery File Uploader when it's not there yet. Always sets the
   * static `currentTarget` property of the FileProofer class to thus, which is
   * a reliable constant to point callbacks at.
   *
   * In earlier versions, we would delegate callback logic by pointing directly
   * at `this`, but that causes the need to reinitialize the upload form every
   * time a different product is being proofed. The very real risk existed that
   * unbinding would not work, and we would end up with one form uploading to
   * two different products.
   *
   * NOTE The fileupload method is not bound to any callbacks at the moment, but
   * we will have to do this.
   *
   * The bind options can be found here:
   * https://github.com/blueimp/jQuery-File-Upload/wiki/Options#additional-callb
   * ack-options-for-the-ui-version
   *
   * Here's an example:
   *
   * FileProofer.$uploadform.fileupload({
   *   // init settings are here
   * }).bind('fileuploadadded', function (e, data) {
   *   // Some callback logic. Note that the next bind can be attached to one
   * }).bind('fileuploaddestroyed', function (e, data) {});
   *
   * @instance
   * @memberof FileProofer
   *
   * @return {void}
   */
  FileProofer.prototype.attachJQueryUploader = function () {
    var _this = this;

    FileProofer.currentTarget = this;

    // Update the action url of the form
    FileProofer.$uploadform.attr('action', this.generateActionLink());

    if (FileProofer.uploadform_unattached) {
      _obj = {
        autoUpload: true,
        acceptFileTypes: /(jpeg)|(jpg)|(png)|(gif)|(doc)|(docx)|(zip)|(rar)|(pdf)|(psd)|(ai)|(eps)|(tiff)|(tif)$/i, // eslint-disable-line max-len
        dropZone: FileProofer.$uploadform,
        // maxChunkSize: 50000, // Max 0,05 mb/request. Usefull for testing only
        // progressInterval: 2000 // Update progress every 2 seconds.
        maxFileSize: 80000000 // 80mb
      };


      // Attach a new fileupload instance
      FileProofer.$uploadform.fileupload(_obj)
      .bind('fileuploadprogress', function (e, data) {
        FileProofer.currentTarget.handleFileProgress(data);
      }).bind('fileuploadadded', function (e, data) {
        FileProofer.currentTarget.running_uploads++;
        FileProofer.currentTarget.updateNextButtonState();
        FileProofer.currentTarget.checkAddedFiles(data);
      }).bind('fileuploaddestroyed', function (e, data) {
        _this.chili_document_id = null;
        _this.chili_builder_data = null;

        $(data.context[0]).remove();
        FileProofer.currentTarget.file_count = FileProofer.countUploadedFiles();

        FileProofer.reduceRunningUploads();
      }).bind('fileuploadfailed', function (e, data) {
        FileProofer.reduceRunningUploads();
        FileProofer.currentTarget.handleUploadError(data);
      }).bind('fileuploaddone', function (e, data) {
        _this.chili_document_id = null;
        _this.chili_builder_data = null;

        FileProofer.currentTarget.file_count = FileProofer.countUploadedFiles(
          data.files.length
        );

        $('#sidebarGoesHere, #widgetGoesHere').html('');

        FileProofer.reduceRunningUploads();

        _this.updateUploadButton();
      });

      // Make sure to keep track of the form registration. Do it here, so any
      // errors that hapened in the initializaton will not cause false
      // assumptions about the uploader being created.
      FileProofer.uploadform_unattached = false;
    }
  };



  FileProofer.reduceRunningUploads = function () {
    if (FileProofer.currentTarget.running_uploads > 0) {
      FileProofer.currentTarget.running_uploads--;
    }
    FileProofer.currentTarget.updateNextButtonState();
  };



  /**
   * Count the number of successufully uploaded files in the html
   *
   * @instance
   * @memberof FileProofer
   *
   * @param {boolean} extra Optionally, pass extra count. Defaults to zero. This
   *                        can be used to include the uploads that have not
   *                        been rendered yet.
   *
   * @return {integer} The amount of files found
   */
  FileProofer.countUploadedFiles = function (extra) {
    if (extra === undefined) {
      extra = 0;
    }

    _i = FileProofer.$uploadform.find('ol .complete-file').length;

    if (extra > 0) {
      return _i + extra;
    }

    return _i;
  };



  /**
   * Updates all next buttons
   *
   * @instance
   * @memberof FileProofer
   *
   * @return {void}
   */
  FileProofer.prototype.updateNextButtonState = function () {

    $('.disabled-by-default').addClass('disabled');

    if (this.file_count > 0 && this.running_uploads === 0) {
      $('.next-step-button', FileProofer.$steps['upload-files'])
        .removeClass('disabled');
    }
  };



  /**
   * Renders error template for each error for each uploaded file if available.
   * Falls back to alert if template is not there.
   *
   * @instance
   * @memberof FileProofer
   *
   * @param {object} data The data received from fileupload
   *
   * @return {void}
   */
  FileProofer.prototype.handleUploadError = function (data) {
    for (_i = 0; _i < data.files.length; _i++) {
      if (data.files[_i].error) {
        $(data.context[_i]).remove();
        if ($('#' + FileProofer.upload_error_template).length > 0) {
          $('.files', FileProofer.$html).prepend(
            tmpl(FileProofer.upload_error_template, {'files': data.files})
          );
        } else {
          // alert(data.files[_i].error);
        }
      }
    }
  };



  /**
   * Checks added files. At the moment it checks for errors and renders these
   * if needed.
   *
   * @instance
   * @memberof FileProofer
   *
   * @param {array} data The data to work with to check
   *
   * @return {boolean} True if no errors
   */
  FileProofer.prototype.checkAddedFiles = function (data) {
    if (data.files.valid) {
      return true;
    }

    for (_i = 0; _i < data.files.length; _i++) {
      if (data.files[_i].error) {
        $(data.context[_i]).remove();
        if ($('#' + FileProofer.validation_message_template).length > 0) {
          $('.files', FileProofer.$html).prepend(
            tmpl(FileProofer.validation_message_template, {'files': data.files})
          );
        } else {
          // alert(data.files[_i].error);
        }
      }
    }

    return false;
  };



  /**
   * Uses an ajax call to ask the server for files the user had uploaded before.
   *
   * @todo Cache this result, render it first and then request the updated
   * version of it.
   *
   * @instance
   * @memberof FileProofer
   *
   * @return {void}
   */
  FileProofer.prototype.gatherPreviousUploads = function () {
    var _this = this;

    // FileProofer.showLoadingOverlay();
    $('.loading-previous-uploads-indicator', FileProofer.$html).show();

    // TODO implement this (caching of result)
    // if (this.previous_results.length > 0) {
    //   FileProofer.$uploadform
    //     .fileupload('option', 'done')
    //     .call(null, null, {result: this.previous_results});
    // }

    _obj = {
      controller: 'upload',
      type: this.type,
      alreadyUploaded: 1
    };

    switch (this.type) {
    case TYPE_ODI:
      // TODO rename both sides to identifier:
      _obj.id_order_detail = this.identifier;
      _obj.id_order = this.order_id;
      break;
    case TYPE_NCI:
      _obj.id_product = this.product_id;
      _obj.identifier = this.identifier;
      break;
    }

    _ajax_request = $.ajax({
      context: FileProofer.$uploadform[0],
      data: _obj,
      dataType: 'json',
      url: '/index.php'
    }).done(function (result) {
      _this.gatherPreviousUploadsC(this, result);
    });

    FileProofer.cancelable_ajax_requests.push(_ajax_request);
  };



  /**
   * Update the filecount, update the next button, show the upload later option.
   * If called on the currently showing uploader, also update the list of
   * previously received files.
   *
   * @param {object} uploader The uploader instance
   * @param {object} result   Received uploaded files wrapped in an object
   *
   * @return {void}
   */
  FileProofer.prototype.gatherPreviousUploadsC = function (uploader, result) {
    if (this.showing) {
      $('.loading-previous-uploads-indicator', FileProofer.$html).hide();
      FileProofer.hideLoadingOverlay();

      $('.files li', FileProofer.$uploadform).remove();

      FileProofer.$uploadform
        .fileupload('option', 'done')
        .call(uploader, null, {result: result});
    }

    this.file_count = 0;
    if (result.files !== undefined) {
      this.file_count = result.files.length;
    }

    this.running_uploads = 0;
    this.updateNextButtonState();

    this.showUploadLater();
    if (this.file_count > 0) {
      this.hideUploadLater();
    }

    this.updateUploadButton();
  };



  /**
   * Update the button with the passed text or figure out what the button text
   * should be. Also show or hide keep shopping button
   *
   * @param {string} text Optional var to set copy
   *
   * @return {object} jQuery object to define.
   */
  FileProofer.prototype.updateUploadButton = function (text) {
    if (text === undefined) {
      text = this.uploadButtonCopy();
    }

    $('.open-file-proofing', this.$container).text(text);

    $('.open-file-proofing', this.$container).removeClass('disabled hidden');
    $('.keep-shopping', this.$container).addClass('hidden');

    if (this.has_cpdf) {
      $('.open-file-proofing', this.$container).addClass('disabled hidden');
      $('.keep-shopping', this.$container).removeClass('hidden');
    }
  };



  /**
   * Checks a few conditions and returns the right text for upload buttons.
   *
   * @return {string} The copy to go on the button
   */
  FileProofer.prototype.uploadButtonCopy = function () {
    if (this.has_cpdf) {
      return editor_translations.upload_complete;
    }

    if (this.file_count > 0) {
      return editor_translations.upload_new;
    }

    if (this.pdft_allowed) {
      return editor_translations.upload_and_proof;
    }

    return editor_translations.upload_plain;
  };



  /**
   * Calls the upload form fileupload method with the option done. This mimics
   * what hapens when a user uploads a file for each passed file, basically
   * completing the html.
   *
   * @param {array} uploads The received files
   *
   * @returns {void}
   */
  FileProofer.prototype.presetUploads = function (uploads) {
    FileProofer.$uploadform
      .fileupload('option', 'done')
      .call(this, null, {result: uploads});
  };



  /**
   * Starts a round of calls to filecheck. The entire process can be
   * repeated x times because sometimes the first check fails but should
   * actually have gone trough.
   *
   * @todo There should really be no need for this. To test what is
   * hapening, set the number of retries to 0.
   *
   * @return {void}
   */
  FileProofer.prototype.startFileCheck = function () {
    if (this.process_state === 'POLLING_FOR_FILECHECK_RESULT') {
      return false;
    }

    this.setProcessStateTo('POLLING_FOR_FILECHECK_RESULT');
    this.full_filecheck_retries = FileProofer.full_filecheck_retries;
    this.performFileCheck();
  };



  /**
   * Uses an ajax call to start validation of the files.
   *
   * @todo Cache this result, render it first and then request the updated
   * version of it.
   *
   * @instance
   * @memberof FileProofer
   *
   * @return {void}
   */
  FileProofer.prototype.performFileCheck = function () {
    var _this = this;

    _obj = {
      controller: 'upload',
      id_product: this.product_id,
      identifier: this.prefixed_identifier,
      validateFiles: 1,
      sku: this.sku,
      id_supplier: this.supplier_id,
      product_name: this.product_details
    };

    _ajax_request = $.ajax({
      cache: false,
      data: _obj,
      dataType: 'json',
      url: '/index.php'
    }).done(function (result) {
      _this.handleFilecheckStartCallback(result);
    }).fail(function () {
      _this.setProcessStateTo('IDLE');
    });

    FileProofer.cancelable_ajax_requests.push(_ajax_request);
  };



  /**
   * Callback for starting filecheck. When the filecheck is started correctly,
   * a new process starts which polls for results.
   *
   * @param {object} result The result from the start call
   *
   * @return {void}
   */
  FileProofer.prototype.handleFilecheckStartCallback = function (result) {
    // Make sure the process has started. Otherwise it's an indecation
    // something is wrong and we will have to handle it.
    if (result !== undefined && result.started) {
      return this.startPollingForFilecheckResult(FileProofer.max_retries);
    }

    FileProofer.hideProofer();
  };



  /**
   * Wrapper for starting the polling. Set's the max attempt count and the state
   *
   * @param {int} max The allowed amount of retries
   *
   * @return {void}
   */
  FileProofer.prototype.startPollingForFilecheckResult = function (max) {
    this.setProcessStateTo('POLLING_FOR_FILECHECK_RESULT');
    this.remaining_poll_requests = max;
    this.pollForFilecheckResult();
  };



  /**
   * Uses an ajax call to poll for validation results.
   *
   * @instance
   * @memberof FileProofer
   *
   * @return {void}
   */
  FileProofer.prototype.pollForFilecheckResult = function () {
    var _this = this;

    _obj = {
      controller: 'upload',
      prefixed_identifier: this.prefixed_identifier,
      identifier: this.prefixed_identifier,
      validationStatus: 1,
      id_product: this.product_id
    };

    // If a wanted response is passed in the url, use it.
    if (getParameterByName('wanted-response')) {
      _obj.wantedResponse = getParameterByName('wanted-response');
    }

    _ajax_request = $.ajax({
      cache: false,
      data: _obj,
      dataType: 'json',
      url: '/index.php'
    }).done(function (result) {
      _this.handleProofingPollResult(result);
    }).fail(function () {
      // TODO This is not enough, when the conection fails we should show a
      // mesage
      _this.setProcessStateTo('IDLE');
    });

    FileProofer.cancelable_ajax_requests.push(_ajax_request);
  };



  /**
   * Process the result of a poll request
   *
   * @param  {[type]} result [description]
   * @return {[type]}        [description]
   */
  FileProofer.prototype.handleProofingPollResult = function (result) {
    var _this = this;

    // If not finished, try again in two seconds
    if (result.finished === false && this.remaining_poll_requests > 0) {
      this.remaining_poll_requests = this.remaining_poll_requests - 1;

      return setTimeout(function () {
        _this.pollForFilecheckResult();
      }, FileProofer.retry_wait_time);
    }

    this.setProcessStateTo('IDLE');
    return this.handleProofingResult(result);
  };



  /**
   * Called when the proofing result is in
   *
   * @instance
   * @memberof FileProofer
   *
   * @param {object} proofing_result The result
   *
   * @return {function} One of the handlers
   */
  FileProofer.prototype.handleProofingResult = function (proofing_result) {
    // If the result is undefined, assume failed proof.
    if (proofing_result ===  undefined ||
      proofing_result.result === undefined ||
      proofing_result.finished === false
    ) {
      this.logFailedProofingResult({
        description: 'Situation unclear. Either no result or an incomplete ' +
        'result was received. Seeing this error is an indication of ' +
        'something being very wrong.'
      });
      return this.handleFailedProofing();
    }

    this.proofing_result = proofing_result;

    this.toggleChiliEditorButtons();

    if (proofing_result.result.hits === undefined) {
      return this.handlePositiveProofingResponse();
    }

    if (proofing_result.result.severity) {
      if (proofing_result.result.severity === 3) {
        for (_i = 0; _i < proofing_result.result.hits.length; _i++) {
          if (this.validError(proofing_result.result.hits[_i])) {
            return this.handleNegativeProofingResponse();
          }
        }
      }

      return this.handlePositiveProofingResponse();
    }
  };



  /**
   * Wraps failed proof. Failed proof can be either due to error in proofer or
   * simply a rejected upload.
   *
   * @param {object} data Arbitrary object with additional info about the failed
   *                      proof. Will be merged with the default values for a
   *                      failed proof.
   *
   * @return {void}
   */
  FileProofer.prototype.logFailedProofingResult = function (data) {
    _obj = {
      successful: false
    };

    _obj = $.extend({}, _obj, data);

    this.logProofingResult(_obj);
  };



  /**
   * Wraps successfull proof.
   *
   * @param {object} data Expects data.description and nothing else.
   *
   * @return {void}
   */
  FileProofer.prototype.logSuccessfullProofingResponse = function (data) {
    _obj = {
      successful: true,
      description: data.description
    };

    this.logProofingResult(_obj);
  };



  /**
   * Wraps proof log to segment. Sets cartid and nci or order id and order
   * detail id, depending on current object type. Merges that data with the
   * received data and sends it to segment.
   *
   * @param {object} data Arbitrary data object with at least a `successful`
   *                      property.
   *
   * @return {void}
   */
  FileProofer.prototype.logProofingResult = function (data) {
    if (analytics === undefined) {
      return;
    }

    _obj = {
      type: this.type,
      cartId: this.cart_id
    };

    if (this.type === TYPE_NCI) {
      _obj.nci = this.identifier;
    }

    if (this.type === TYPE_ODI) {
      _obj.orderId = this.order_id;
      _obj.orderdetailId = parseInt(this.identifier);
    }

    _obj = $.extend({}, _obj, data);

    analytics.track('Proofing Result', _obj);
  };



  /**
   * Check passed error to see if it is not one of the errors we wish to ignore
   *
   * @instance
   * @memberof FileProofer
   *
   * @param {object} error An error object as generated by pdftoolbox
   *
   * @return {boolean} Wether the error was valid or not
   */
  FileProofer.prototype.validError = function (error) {
    _a = [];

    if (error.severity < 3) {
      return false;
    }

    // No description is always a valid error
    if (error.description === null || error.description.length === 0) {
      console.warn('Got an error with no description');
      console.warn(error);
      return true;
    }

    // Check each line to see if it is a hit
    for (_i = 0; _i < error.description.length; _i++) {
      if (error.description[_i].startsWith('Hit	Error')) {
        _a.push(error.description[_i]);
      }
    }

    // No errors or more then one is always a valid error
    if (_a.length === 0 || _a.length > 1) {
      return true;
    }

    // if (_a[0] === 'Hit	Error	Font not embedded	Helvetica') {
    //   console.warn(
    //     'Marked this error as "not valid", effectively ignoring it. This ' +
    //     'is really something you should only see on a development server, ' +
    //     'and only when an error was known and expected to be skipped. ' +
    //     'Please check the error to see if you expect it to be skipped. If ' +
    //     'you find an error that should not be skipped, contact dev.'
    //   );
    //   console.warn(error);
    //   return false;
    // }

    return true;
  };



  /**
   * Expects to send something like this into the lib:
   *
   * FileProofer.chili_lib.generateChiliEditorFromTemplateData({
   *  name: 'Variable_Template_Portrait_Multipage',
   *  locale: 'en-US',
   *  additional_variables: {
   *    documentVariables: {'size': 'A4'},
   *    documentImages: [
   *      {
   *        'tagName': 'placeholder_1',
   *        'name': 'Front image',
   *        'remoteURL': 'full url',
   *        'highResPdfURL': 'full url',
   *        'fileInfo': '<fileInfo width="397" height="400" resolution="72"
   *         fileSize="280 kB" />'
   *      } ,
   *      {
   *        'tagName': 'placeholder_2',
   *        'name': 'Front image 2',
   *        'remoteURL': 'full url',
   *        'highResPdfURL': 'full url',
   *        'fileInfo': '<fileInfo width="397" height="400" resolution="72"
   *         fileSize="280 kB" />'
   *      }
   *    ]
   *  }
   * });
   *
   * @instance
   * @memberof FileProofer
   *
   * @return {void}
   */
  FileProofer.prototype.openChiliEditor = function () {
    if (this.chili_document_id > 0) {
      FileProofer.hideLoadingOverlay();
      return FileProofer.chili_lib.$chili_builder_area.show();
    }

    FileProofer.chili_lib.shop_product_id = this.product_id;

    this.fixupChiliData();

    return FileProofer.chili_lib.generateChiliEditorFromTemplateData(
      this.proofing_result.chili, true
    );
  };



  /**
   * Checks urls within the document and strips away all irrelevant parts.
   *
   * @todo This should improve much. Backand should only return urls that can be
   *       used right away
   *
   * @instance
   * @memberof FileProofer
   *
   * @return {void}
   */
  FileProofer.prototype.fixupChiliData = function () {
    _obj = this.proofing_result.chili;
    _a = ['highResPdfURL', 'remoteURL'];

    // TODO This locale logic should get implemented
    // _obj.locale = FileProofer.language_map[this.language];

    _obj.additional_variables.container = document.getElementById(
      'widgetGoesHere'
    );

    _obj.additional_variables.sidebarContainer = document.getElementById(
      'sidebarGoesHere'
    );

    _obj.additional_variables.i18n = editor_translations;

    for (_i = 0; _i < _obj.additional_variables.documentImages.length; _i++) {
      for (_j = 0; _j < _a.length; _j++) {
        _s = _obj.additional_variables.documentImages[_i][_a[_j]];
        _s = _s.replace(/^.+\/prestashop-web/,'');
        _s = _s.replace(/^.+\/production/,'');
        _obj.additional_variables.documentImages[_i][_a[_j]] = _s;
      }

      if (_obj.additional_variables.documentImages[_i].tagName === undefined) {
        _s = 'placeholder_' + (_i + 1);
        _obj.additional_variables.documentImages[_i].tagName = _s;
      }
    }

    if (_obj.name === null || _obj.name === undefined || _obj.name === '') {
      console.warn('No Chili template name was defined.');
      console.warn(_obj);
      _obj.name = 'Variable_Template_Portrait';
    }
  };



  /**
   * Handle all the received data and show the right screen in case of a
   * positive response (file proofed and found workable).
   *
   * @instance
   * @memberof FileProofer
   *
   * @return {void}
   */
  FileProofer.prototype.handlePositiveProofingResponse = function () {
    this.setProcessStateTo('IDLE');

    this.logSuccessfullProofingResponse({
      description: 'File proofed succesfully'
    });

    switch (this.process_state) {
    case 'PERFORMING_FINAL_CHECK':
      return FileProofer.hideProofer();
    default:
      return this.goToStep('filecheck-result');
    }
  };



  /**
   * Handle all the received data and show the right screen in case of a
   * negative response (file proofed but not good enough yet).
   *
   * @instance
   * @memberof FileProofer
   *
   * @return {void}
   */
  FileProofer.prototype.handleNegativeProofingResponse = function () {
    if (this.full_filecheck_retries > 0) {
      this.full_filecheck_retries = this.full_filecheck_retries - 1;
      return this.performFileCheck();
    }

    _a = [];

    for (_i = 0; _i < this.proofing_result.result.hits.length; _i++) {
      _obj = this.proofing_result.result.hits[_i];
      if (_obj.severity > 2) {
        _a.push(_obj);
      }
    }

    this.logFailedProofingResult({
      errors: _a,
      description: 'Proofing failed. See received errors and warnings.'
    });

    this.renderErrors();
    this.goToStep('wrong-number-of-pages');
  };



  /**
   * Don't show the buttons if the we cant edit
   *
   * @instance
   * @memberof FileProofer
   *
   * @return {[type]} [description]
   */
  FileProofer.prototype.toggleChiliEditorButtons = function () {
    if (
      this.has_chili_support === false ||
      this.proofing_result.chili === undefined ||
      this.proofing_result.chili.name === undefined ||
      this.proofing_result.chili.name === '' ||
      this.proofing_result.chili.name === 'null' ||
      this.proofing_result.chili.additional_variables.documentImages === null
    ) {
      $('.hide-if-chili-is-available', FileProofer.$html).show();
      return $('.show-if-chili-is-available', FileProofer.$html).hide();
    }

    $('.hide-if-chili-is-available', FileProofer.$html).hide();
    return $('.show-if-chili-is-available', FileProofer.$html).show();
  };



  /**
   * Renders the received error codes to the localise ones. Also glues them
   * together.
   *
   * Right now it only uses the wrong page count error because all the others
   * are not really usable for users.
   *
   * @instance
   * @memberof FileProofer
   *
   * @return {[type]} [description]
   */
  FileProofer.prototype.renderErrors = function () {
    _a = [];
    _$obj = $('.failed-because', FileProofer.$html);
    _s = _$obj.data('base');
    _s2 = _$obj.data('and');

    for (_i = 0; _i < this.proofing_result.result.hits.length; _i++) {
      _obj = this.proofing_result.result.hits[_i];
      // if (_obj.severity > 2) {
      if (_obj.code === PDFT_ERROR_WRONG_PAGE_COUNT) {
        _a.push(_obj);
      }
    }

    if (_a.length > 0) {
      _s = _s + ' ' + _$obj.data('because');
    }

    for (_i = 0; _i < _a.length; _i++) {
      _s3 = warning_messages[_a[_i].code];
      if (warning_messages[_a[_i].code] === undefined) {
        _s3 = _a[_i].shortname;
      }
      _s = _s + ' ' + _s3;

      // Add "and" unless this is the last item in the array. Otherwise add a
      // dot.
      if (_i < _a.length - 1) {
        _s = _s + ' ' + _s2;
      }
    }

    _s = _s + '.';

    _$obj.text(_s);
  };



  /**
   * Handle a failed proof.
   *
   * @instance
   * @memberof FileProofer
   *
   * @return {void}
   */
  FileProofer.prototype.handleFailedProofing = function () {
    return this.goToStep('filecheck-failed');
  };



  /**
   * Generates the action link for the uploadform
   *
   * @instance
   * @memberof FileProofer
   *
   * @return {string} The url for the upload form to use.
   */
  FileProofer.prototype.generateActionLink = function () {
    switch (this.type) {
    case TYPE_NCI:
      return '/index.php?controller=upload&id_product=' + this.product_id + '&identifier=' + this.identifier; // eslint-disable-line max-len
    case TYPE_ODI:
      return '/index.php?controller=upload&id_order=' + this.order_id + '&id_order_detail=' + this.identifier; // eslint-disable-line max-len
    }

  };



  /**
   * Attach all js listeners that are always on. Some listeners should not be
   * registered constantly. These are not to be registered using this method.
   *
   * @instance
   * @memberof FileProofer
   *
   * @return {void}
   */
  FileProofer.prototype.attachListeners = function () {
    var _this = this;

    $('.step-navigation', FileProofer.$html).on('click', function (e) {
      e.preventDefault();

      // Prevent navigation using disabled button.
      if ($(e.currentTarget).hasClass('disabled')) {
        return false;
      }
      _this.goToStep($(e.currentTarget).data('to-step'));
    });

    $('.proof-result-radios input', FileProofer.$html)
      .on('change', function (e) {
        _this.handleFrontBackBlankChange(e);
      });

    $('.close-file-proofer', FileProofer.$html).on('click', function (e) {
      e.preventDefault();

      _c = confirm(fixed_copy.closingwarning);
      if (_c) {
        _this.getOrderDetailHistory();
        FileProofer.hideProofer();
      }
    });

    $('.files', FileProofer.$html)
      .on('click', '.error .proofing-remove-message', function (e) {
        $(e.currentTarget).parent('li').remove();
      });

    $('.open-chili-editor', FileProofer.$html).on('click', function (e) {
      e.preventDefault();
      FileProofer.showLoadingOverlay();
      _this.openChiliEditor();
    });

    $('.finish-proofer', FileProofer.$html).on('click', function (e) {
      e.preventDefault();

      if ($(e.currentTarget).hasClass('disabled')) {
        return false;
      }

      if ($(e.currentTarget).hasClass('mark-as-cpdf')) {
        return _this.handleFinishWithCpdf();
      }

      if ($(e.currentTarget).hasClass('manual-check')) {
        return _this.handleFinishWithManualCheck();
      }

      return _this.closeAfterFinish();
    });

    $('.starts-filecheck', FileProofer.$html).on('click', function (e) {
      e.preventDefault();
      if (_this.pdft_allowed) {
        _this.startFileCheck();
      }
    });
  };



  /**
   * When the user clicks a link that should finish and mark as cpdf.
   *
   * @instance
   * @memberof FileProofer
   *
   * @return {[type]} [description]
   */
  FileProofer.prototype.handleFinishWithCpdf = function () {
    // This goes before the actual call, as we don't want the risk that the user
    // uploads another file or deletes the accepted one.
    this.has_cpdf = true;
    this.updateUploadButton();

    this.markAttachmentAsCPDF();
    return this.closeAfterFinish();
  };



  /**
   * When the user clicks a link that should close and set manual check.
   *
   * @return {void}
   */
  FileProofer.prototype.handleFinishWithManualCheck = function () {
    this.markAttachmentAsManualCheck();
    return this.closeAfterFinish();
  };



  /**
   * Clean close. Hides the editor.
   *
   * @return {void}
   */
  FileProofer.prototype.closeAfterFinish = function () {
    this.goToStep('upload-files');
    // this.requestDefiniteSave();
    FileProofer.hideProofer();
  };




  /**
   * Performs a non cancelable ajax request to the backend to mark the current
   * attachment as CPDF (production ready). On the backend, this either means
   * the upload is moved to a the uploads/cpdfs dir, or the order detail
   * attachment is marked as a cPDF.
   *
   * @instance
   * @memberof FileProofer
   *
   * @return {void}
   */
  FileProofer.prototype.markAttachmentAsCPDF = function () {
    var _this = this;

    _obj = {
      controller: 'upload',
      identifier: this.identifier,
      action: 'markAttachmentAsCPDF',
      ajax: 1,
      type: this.type
    };

    $.ajax({
      cache: false,
      data: _obj,
      dataType: 'json',
      url: '/index.php'
    }).done(function (result) {
      _this.order_history = result.result.history;
      _this.delivery_data = result.result.delivery_date;

      _this.handleMarkAttachmentCPDFResponse();
    });
  };



  /**
   * Performs a non cancelable ajax request to the backend to mark the current
   * attachment as CPDF (production ready). On the backend, this either means
   * the upload is moved to a the uploads/cpdfs dir, or the order detail
   * attachment is marked as a cPDF.
   *
   * @instance
   * @memberof FileProofer
   *
   * @return {void}
   */
  FileProofer.prototype.markAttachmentAsManualCheck = function () {
    return this.getOrderDetailHistory();
  };



  /**
   * Calls to get the latest detail history
   *
   * @return {[type]} [description]
   */
  FileProofer.prototype.getOrderDetailHistory = function () {
    var _this = this;

    _obj = {
      controller: 'upload',
      identifier: this.identifier,
      action: 'getOrderHistory',
      ajax: 1,
      type: this.type
    };

    $.ajax({
      cache: false,
      data: _obj,
      dataType: 'json',
      url: '/index.php'
    }).done(function (result) {
      _this.order_history = result.result;
      _this.delivery_data = result.delivery_date;

      _this.updateOrderDetailsAndState();
    });
  };



  /**
   * Trigered when the result has data and the status is to be shown
   *
   * @param {object} result The received response
   *
   * @return {void}
   */
  FileProofer.prototype.handleMarkAttachmentCPDFResponse = function () {
    if (this.show_order_status) {
      this.updateOrderDetailsAndState();
    }
  };



  /**
   * Updates orderdetails
   *
   * @param {object} result The received response
   *
   * @return {[type]} [description]
   */
  FileProofer.prototype.updateOrderDetailsAndState = function () {
    switch ($(this.$status_container, this.$container).data('type')) {
    case 'list':
      this.updateOrderDetailsAndStateAsList();
      break;
    default:
      this.updateOrderDetailsAndStateAsText();
    }
  };



  /**
   * Updates just a single line to the new state
   *
   * @return {void}
   */
  FileProofer.prototype.updateOrderDetailsAndStateAsText = function () {
    $(this.$status_container, this.$container).text('');
    _obj = this.order_history[0];
    _s = 'key_' + _obj.id_order_detail_state;
    $(this.$status_container, this.$container).text(status_codes[_s]);
  };



  /**
   * Render a new list of order details.
   *
   * @return {void}
   */
  FileProofer.prototype.updateOrderDetailsAndStateAsList = function () {
    $(this.$status_container, this.$container).html('');

    for (_i = 0; _i < this.order_history.length; _i++) {
      _obj = this.order_history[_i];

      _s = 'key_' + _obj.id_order_detail_state;

      if (_obj.id_order_detail_state === 0 ||
        status_codes[_s] === undefined
      ) {
        continue;
      }

      _s2 = '<p class="date">' +  _obj.date_add + '</p> ';
      $(this.$status_container, this.$container).append(
        $('<li>' + _s2 + status_codes[_s] + '</li>')
      );
    }

    $('ul.details li', this.$container).first().addClass('nobold');

    _obj = this.order_history[0];
    _s = 'key_' + _obj.id_order_detail_state;
    $('.current-order-state', this.$container).text(status_codes[_s]);

    if (this.delivery_date) {
      $('.expected-date', this.$container).text(this.delivery_date);
    }

    $('.in-production', this.$container).addClass('extra-class');
  };



  /**
   * Handles the switch between frontend or back-end, to make sure when the one
   * becomes front, the other becomes back.
   *
   * @instance
   * @memberof FileProofer
   *
   * @param {object} event The event
   *
   * @return {void}
   */
  FileProofer.prototype.handleFrontBackBlankChange = function (event) {
    _$obj = $(event.currentTarget);
    _$parent_fieldset = _$obj.parent('fieldset');
    _i = (_$parent_fieldset.data('double-fieldset') == 1 ? 2 : 1);
    _$other_fieldset = $('#double-fieldset-' + _i);

    // The switch covers only changing to front or back, because setting the
    // value to blank is no reason to change any other values.
    switch (_$obj.val()) {
    case 'front':
      $('.option-blank').hide();
      _$other_fieldset
        .find('.option-back', FileProofer.$html)
        .attr('checked', 'checked');
      _$other_fieldset.find('.option-blank', FileProofer.$html).show();
      break;
    case 'back':
      $('.option-blank').hide();
      _$other_fieldset
        .find('.option-front', FileProofer.$html)
        .attr('checked', 'checked');
      _$parent_fieldset.find('.option-blank', FileProofer.$html).show();
      break;
    }
  };



  /**
   * Unbind all registered listeners. This is needed to prevent multiple
   * callbacks registering on the same event when the proofer opens for
   * different identifier's.
   *
   * @static
   * @memberof FileProofer
   *
   * @return {void}
   */
  FileProofer.unbindListeners = function () {
    $('.step-navigation', FileProofer.$html).unbind('click');
    $('.proof-result-radios input', FileProofer.$html).unbind('change');
    $('.close-file-proofer', FileProofer.$html).unbind('click');
    $('.approve-artworks', FileProofer.$html).unbind('change');
    $('.files .error .proofing-remove-message', FileProofer.$html)
      .unbind('click');
    $('.open-chili-editor', FileProofer.$html).unbind('click');
    $('.finish-proofer', FileProofer.$html).unbind('click');
    $('.starts-filecheck', FileProofer.$html).unbind('click');
  };



  /**
   * Update the progression value of a single upload. Uses _i internally, which
   * is the shared variable for integer values. Reassigned every time so safe.
   *
   * @instance
   * @memberof FileProofer
   *
   * @param {object} data  The data about the progress
   *
   * @return {void}
   */
  FileProofer.prototype.handleFileProgress = function (data) {
    _val = parseInt(data.loaded / data.total * 100, 10) + '%';

    $('.progress .progress-bar', $(data.context[0])).css(
      'width', _val
    );

    $('.progress-percentage', $(data.context[0])).text(_val);
  };



  /**
   * Adds a file to the internal array of files
   *
   * @instance
   * @memberof FileProofer
   *
   * @param {file} file The file to add
   *
   * @return {void}
   */
  FileProofer.prototype.addFile = function (file) {
    this.files.push(file);
  };



  /**
   * Shows the proofer html. To prevent large bulks of html from being
   * generated, all proofers use the same html. Therefor, the proofer might need
   * to replace some of the content within the html to be appropriate for this
   * identifier state.
   *
   * @instance
   * @memberof FileProofer
   *
   * @return {void}
   */
  FileProofer.prototype.showProofer = function () {
    FileProofer.$html.show();
    this.showing = true;
    this.proofing_errors = [];
    this.resetStates();
    this.attachListeners();
    this.attachJQueryUploader();
    this.gatherPreviousUploads();
    this.replaceDynamicContent();
    this.setChiliCallbacks();
    this.showAvailableNavigation();
    $('html').css('overflow-y', 'hidden');
  };



  /**
   * Iterates and toggle all elements that might be hidden for some products.
   *
   * @return {void}
   */
  FileProofer.prototype.showAvailableNavigation = function () {
    var _this = this;

    $('.optional-step-indicator').each(function (i,e) {
      if (_this.available_steps.indexOf($(e).data('related-to-step')) === -1) {
        return $(e).hide();
      }

      return $(e).show();
    });
  };



  /**
   * Set callback logic on all events
   *
   * @instance
   * @memberof FileProofer
   *
   * @return {void}
   */
  FileProofer.prototype.setChiliCallbacks = function () {
    var _this = this;

    FileProofer.chili_lib.generateEditorCallback = function (jsonData) {
      _this.chili_builder_data = jsonData.data;
      _this.chili_document_id = _this.chili_builder_data.documentId;
      FileProofer.hideLoadingOverlay();
      $('#editor-cancel-btn').attr('value', 'Annuleren');
      $('#editor-approve-btn').attr('value', 'Verder');
    };

    FileProofer.chili_lib.cancelCallback = function () {
      HPLE_removeEditor();
      FileProofer.chili_lib.$chili_builder_area.hide();
    };

    // FileProofer.chili_lib.finishedCallback = function () {};

    FileProofer.chili_lib.approvedCallback = function () {
      _this.handleApprovedCallback();
    };

    FileProofer.chili_lib.getPreviewCallback = function (data) {
      _this.proofing_result.chili_previews = data.data;
      // _this.handlePositiveProofingResponse();
    };

    FileProofer.chili_lib.generateDocumentExportIdCallback = function (data) {
      _this.handleGenDocumentExportIdCallback(data);
    };

    FileProofer.chili_lib.storeExportCallback = function (data) {
      _this.handleStoreExportCallback(data);
    };
  };



  /**
   * Wraps callback from approve click, which is available inside the chili
   * editor. Makes sure the editor is hiden and detached, and also generates
   * the export id; a chili id that is used to fetch the export result.
   *
   * @return {void}
   */
  FileProofer.prototype.handleApprovedCallback = function () {
    // Go to checking step
    this.goToStep('filecheck');

    // Hide the Chili editor
    HPLE_removeEditor();
    FileProofer.chili_lib.$chili_builder_area.hide();

    // Make sure we know Chili was used
    this.uses_chili_result = true;

    // Start generating the document
    FileProofer.chili_lib.generateDocumentExportId(
      this.chili_document_id,
      this.sku
    );
  };



  /**
   * Wraps the generated document export id.
   *
   * @param {object} data The data received (just an export id is needed)
   *
   * @return {void}
   */
  FileProofer.prototype.handleGenDocumentExportIdCallback = function (data) {
    this.chili_export_ids = [];
    this.chili_export_ids.push(data.exportId);
    this.max_store_export_callback_retries = FileProofer.max_retries;
    this.saveChiliExport();

    // Request preview image, which should be there by now
    this.requestPreviewImages();
  };



  /**
   * Handles the response StoreExport callback.
   *
   * @param {obj} data The data received from the server
   *
   * @return {function} Either call to retry or change
   */
  FileProofer.prototype.handleStoreExportCallback = function (data) {
    if (data.error === true) {
      return this.retryHandleStoreExportCallback();
    }

    if (data.status === 'finished'
      || data.status === 'started-new-validation') {
      this.gatherPreviousUploads();

      if (data.status === 'finished') {
        this.startFileCheck();
      }

      if (data.status === 'started-new-validation') {
        this.startPollingForFilecheckResult(FileProofer.max_retries);
      }

      return this.goToStep('filecheck');
    }

    return this.retryHandleStoreExportCallback();
  };



  /**
   * Callback for retry. Store Export is the method that saves an export from
   * Chili to our own file system
   *
   * @return {void}
   */
  FileProofer.prototype.retryHandleStoreExportCallback = function () {
    var _this = this;

    if (this.max_store_export_callback_retries === 0) {
      return this.handleFailedProofing();
    }

    this.max_store_export_callback_retries--;

    setTimeout(function () {
      // Should perform another call to the chili storing endpoint in order to
      // get the latest status
      _this.saveChiliExport();
    }, FileProofer.retry_wait_time);
  };



  /**
   * Creates an object that our library can work with, and trigger a save event
   * for each existing export id.
   *
   * @return {void}
   */
  FileProofer.prototype.saveChiliExport = function () {
    for (_i = 0; _i < this.chili_export_ids.length; _i++) {
      _obj = {
        document_id: this.chili_document_id,
        export_id: this.chili_export_ids[_i],
        identifier: this.identifier,
        product_id: this.product_id,
        supplier_id: this.supplier_id,
        sku: this.sku,
        product_name: this.product_details
      };

      FileProofer.chili_lib.storeExport(_obj);
    }
  };



  /**
   * Uses chili_lib to request the preview image Chili generates. See also
   * `getAttachementsStatus`.
   *
   * @return {[type]} [description]
   */
  FileProofer.prototype.requestPreviewImages = function () {
    FileProofer.chili_lib.getDocumentPreviewImages(
      this.chili_builder_data.documentId
    );
  };



  /**
   * Repaces strings in the proofer with translated strings or strings tailored
   * to the content, like product name, description or requirements.
   *
   * @return {void}
   */
  FileProofer.prototype.replaceDynamicContent = function () {
    var _this = this;

    $('.dynamic-content', FileProofer.$html).each(function (i, e) {
      _s = $(e).data('expected-content');
      if (_this.copy[_s] === undefined ) {
        console.log('Can\'t find key in array:', _s, _this.copy);
        return;
      }
      $(e).text(_this.copy[_s]);
    });
  };



  /**
   * Some buttons need to be disabled untill some specific results are in, and
   * we need to show the right step.
   *
   * @instance
   *
   * @return {void}
   */
  FileProofer.prototype.resetStates = function () {
    $('.disabled-by-default', FileProofer.$html).addClass('disabled');
    $('.files', FileProofer.$html).html('');
    this.goToStep(this.current_step);
  };



  /**
   * Navigate to another step and store what the current step is. Also show the
   * right sidebar content. Uses the objects list of available steps to prevent
   * going to an unavailable step. If that hapens, the proofer is closed with no
   * further actions.
   *
   * @instance
   * @memberof FileProofer
   *
   * @param {string} step The step to go to
   *
   * @return {void}
   */
  FileProofer.prototype.goToStep = function (step) {
    if (this.available_steps.indexOf(step) === -1) {
      this.getOrderDetailHistory();
      return FileProofer.hideProofer();
    }

    // Register what the current step is
    this.current_step = step;

    this.toggleStep();
    this.toggleSidebar();
    this.toggleOnlyOns();
    this.updateNavigation();
    this.performStepsActions();
  };



  /**
   * Calls the callback method of a step if that step has it. A method can be
   * defined for each step.
   *
   * @return {void}
   */
  FileProofer.prototype.performStepsActions = function () {
    if (FileProofer.prototype.stepActions[this.current_step] !== undefined) {
      FileProofer.prototype.stepActions[this.current_step](this);
    }
  };



  /**
   * Activate the newly selected step
   * @return {void}
   */
  FileProofer.prototype.toggleStep = function () {
    $('.proofer-step', FileProofer.$html).hide();
    $('#proofer-step-' + this.current_step, FileProofer.$html).show();
  };



  /**
   * Show the right sidebar for the current step or the default sidebar
   *
   * @return {void}
   */
  FileProofer.prototype.toggleSidebar = function () {
    $('.sidebar-section', FileProofer.$html).hide();
    _s = '#sidebar-section-' + this.current_step;
    if ($(_s, FileProofer.$html).length > 0) {
      $(_s, FileProofer.$html).show();
    } else {
      $('#sidebar-section-default', FileProofer.$html).show();
    }
  };



  /**
   * "Only Ons" are elements with the class only on. They should always have
   * a data attribute which tells what page to show on. Convinient for omni
   * present elements that need to be shown in just some locations
   *
   * @return {void}
   */
  FileProofer.prototype.toggleOnlyOns = function () {
    var _this = this;

    $('.only-on', FileProofer.$html).hide();
    $('.only-on', FileProofer.$html).each(function (i, e) {
      if ($(e).data('only-on') === _this.current_step) {
        $(e).show();
      }
    });
  };



  /**
   * Updates the navigation items. All are completely disabled by default, and
   * then set to active again progressively.
   *
   * @return {[type]} [description]
   */
  FileProofer.prototype.updateNavigation = function () {
    $('#proofer-step-indicator .step', FileProofer.$html)
      .removeClass('active completed');

    switch (this.current_step) {
    case 'upload-files':
      $('#step-indecator-upload-files', FileProofer.$html)
        .addClass('active');
      break;
    case 'filecheck':
      $('#step-indecator-filecheck', FileProofer.$html)
        .addClass('active');
      $('#step-indecator-upload-files', FileProofer.$html)
        .addClass('completed');
      break;
    default:
      _s = '#step-indecator-upload-files, #step-indecator-filecheck';
      $(_s, FileProofer.$html)
        .addClass('completed');
      $('#step-indecator-filecheck-result', FileProofer.$html)
        .addClass('active');
    }
  };



  /**
   * Get regular previews as generated by PDFToolbox, not Chili previews
   *
   * @param {function} callback_with_previews The callback that will run once
   *                                          done. This expects a results param
   *                                          and `_this`, a wrapper of `this`,
   *                                          to allow defining callbacks
   *                                          outside the current instance.
   * @param {function} callback_without_previews The callback that will run once
   *                                          done. This expects a results param
   *                                          and `_this`, a wrapper of `this`,
   *                                          to allow defining callbacks
   *                                          outside the current instance.
   * @param {integer} retry                   If bigger then zero, the request
   *                                          will be retried as often as the
   *                                          passed number states, always two
   *                                          seconds after the last result came
   *                                          in.
   *
   * @return {boolean} Indicates function executed as expected.
   */
  FileProofer.prototype.getAttachementsStatus = function (
    callback_with_previews, callback_without_previews, retry
  ) {
    var _this = this;

    if (isNaN(retry) || retry === undefined) {
      retry = 0;
    }

    if (callback_with_previews === undefined ||
      callback_without_previews === undefined
    ) {
      return false;
    }

    _obj = {
      controller: 'upload',
      identifier: this.prefixed_identifier,
      action: 'getPreviewImages',
      ajax: 1,
      'no-order-needed': 1,
      type: this.type
    };

    _ajax_request = $.ajax({
      cache: false,
      data: _obj,
      dataType: 'json',
      url: '/index.php'
    }).done(function (result) {
      if (result.success === false ) {
        if (retry === 0) {
          return;
        }

        return setTimeout(function () {
          _this.getAttachementsStatus(
            callback_with_previews, callback_without_previews, retry - 1
          );
        }, FileProofer.retry_wait_time);
      }

      if (result.previews_available) {
        _this.preview_images = result.data.files;
        return callback_with_previews(result, _this);
      }

      return callback_without_previews(result, _this);

    });

    FileProofer.cancelable_ajax_requests.push(_ajax_request);

    return true;
  };




  /**
   * Hides the proofer html.
   *
   * @memberof FileProofer
   *
   * @static
   *
   * @return {void}
   */
  FileProofer.hideProofer = function () {
    FileProofer.$html.hide();
    for (_i = 0; _i < FileProofer.instances.length; _i++) {
      FileProofer.instances[_i].showing = false;
    }

    FileProofer.unbindListeners();
    $('html').css('overflow-y', 'scroll');

    // Cancel any requests that might still be running:
    for (_i = 0; _i < FileProofer.cancelable_ajax_requests.length; _i++) {
      FileProofer.cancelable_ajax_requests[_i].abort();
    }
    FileProofer.cancelable_ajax_requests = [];
  };



  /**
   * Show the tranaparent black overlay that helps to indicate something is
   * still in progress.
   *
   * @static
   * @memberof FileProofer
   *
   * @return {object} The result of the show method
   */
  FileProofer.showLoadingOverlay = function () {
    return $('#loading-overlay').show();
  };



  /**
   * Hide the tranaparent black overlay that helps to indicate something is
   * still in progress.
   *
   * @static
   * @memberof FileProofer
   *
   * @return {object} The result of the hide method
   */
  FileProofer.hideLoadingOverlay = function () {
    $('#loading-overlay').hide();
  };



  /**
   * Hides the upload later option
   *
   * @return {object} Jquery object
   */
  FileProofer.prototype.hideUploadLater = function () {
    $('.upload-later-container', this.$container).hide();
  };



  /**
   * Shows the upload later option
   *
   * @return {object} Jquery object
   */
  FileProofer.prototype.showUploadLater = function () {
    $('.upload-later-container', this.$container).hide();
  };



  /**
   * Use the preview image in the container.
   *
   * @param {string} preview The url of the preview
   *
   * @return {object} Jquery object
   */
  FileProofer.prototype.setPreviewOnContainer = function (preview) {
    _s = this.convertPreviewFilePathToUrl(preview, 1, 'png');
    $('.fileproof-upload', this.$container).css(
      'background-image',
      'url(' + _s + ')'
    );

    $('.no-preview', this.$container).hide();
  };



  /**
   * Ajax request to see if a CPDF is already present. Used to see if the button
   * should be enabled
   *
   * @return {void}
   */
  FileProofer.prototype.getCPDFStatus = function () {
    var _this = this;

    _obj = {
      controller: 'upload',
      id_product: this.product_id,
      identifier: this.prefixed_identifier,
      alreadyCpdf: 1,
      sku: this.sku,
      id_supplier: this.supplier_id
    };

    _ajax_request = $.ajax({
      cache: false,
      data: _obj,
      dataType: 'json',
      url: '/index.php'
    }).done(function (result) {
      _this.has_cpdf = result;
      _this.updateUploadButton();
    });
  };



  /**
   * Wrapper of the resonse from the first call to get previews. Inteded as the
   * callback passed from outside.
   *
   * @return {void}
   */
  FileProofer.prototype.setFirstPreview = function () {
    // Find the item without "overlay" in it's name
    for (_i = 0; _i < this.preview_images.length; _i++) {
      if (this.preview_images[_i].indexOf('overlay') === -1) {
        _s = this.preview_images[_i];
        this.hideUploadLater();
        this.setPreviewOnContainer(_s);
        break;
      }
    }
  };

  return FileProofer;
})();



/**
 * This is where the magic hapens
 */
$(document).ready(function () {
  // Progressively hide the fileproofer by default. This prevents it from being
  // hidden when js would not work.
  FileProofer.init($('#file-proofer'));
  FileProofer.$html.hide();

  // Prepare the fileproofer only if there are links on the page that are
  // expected to show the proofer.
  if ($('.open-file-proofing').length > 0 ) {
    // Iterate all buttons:
    $('.open-file-proofing').each(function (i, e) {
      // Cache the identifier and object;
      _$obj = $(e);
      _i = _$obj.data('identifier').toString();
      _s = _$obj.data('type');

      products_requiring_upload.push(_i);

      _s2 = '';

      switch (_s) {
      case TYPE_NCI:
        _s2 = 'nci-';
        break;
      }

      _obj = {
        sku: _$obj.data('sku'),
        identifier: _i,
        supplier_id: _$obj.data('supplier-id'),
        product_id: _$obj.data('product-id'),
        copy: product_copy[_i],
        type: _s,
        prefixed_identifier: _s2 + _i,
        $container: _$obj.closest('.' + _$obj.data('container-class')),
        language: _$obj.data('language'),
        show_order_status: _$obj.data('show-order-status') === 1,
        has_chili_support: _$obj.data('has-chili') === 1,
        pdft_allowed: _$obj.data('pdft-allowed') === 1,
        $status_container: _$obj.data('status-container')
      };

      if (_s === TYPE_ODI) {
        _obj.order_detail_id = _$obj.data(TYPE_ODI);
        _obj.order_id = _$obj.data('order-id');
        _obj.prefixed_identifier = _i;
        _obj.cart_id = _$obj.data('cart-id');
        _obj.product_details = _$obj.data('product-details');
      }

      // Create a new object only if it's not already there for this identifier.
      // There could be multiple buttons on the same page for the same
      // identifier, we don't want to create duplicate objects.
      if (!(_i in file_proofers)) {
        _obj = new FileProofer(_obj);

        file_proofers[_i] = _obj;

        // Try to get the previews right away.
        _obj.getAttachementsStatus(function (result, _this) {
          if (_this.preview_images.length > 0 && _this.$container.length > 0) {
            _this.setFirstPreview();
          }
        }, function (result, _this) {
          _this.changePreviewContainerToGotFiles();
        });
      }

      // When the link is clicked, call the showProofer method on the related
      // FileProofer object.
      _$obj.on('click', function (f) {
        f.preventDefault();
        if ($(f.currentTarget).hasClass('disabled')) {
          return false;
        }

        file_proofers[$(f.currentTarget).data('identifier')].showProofer();
      });
    });
  }
});
