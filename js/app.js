$(function () {
  function onlyDigits(s){return s.replace(/\D/g,'')}
  function formatCEP(d){return d.replace(/(\d{5})(\d{3})/,'$1-$2')}

  $('#cep').on('input',function(){
    this.value = onlyDigits(this.value).slice(0,8)
  })

  $('#cep').on('blur',function(){
    const cep = onlyDigits(this.value)
    if(cep.length!==8) return
    $.getJSON('https://viacep.com.br/ws/'+cep+'/json/',function(d){
      if(d && !d.erro){
        $('#cep').val(formatCEP(cep))
        $('#logradouro').val(d.logradouro||'')
        $('#bairro').val(d.bairro||'')
        $('#municipio').val(d.localidade||'')
        $('#uf').val(d.uf||'')
        $('#complemento').val(d.complemento||'')
      }
    })
  })

  function recalc($item){
    const q = parseFloat($item.find('.qtd').val()||'0')
    const v = parseFloat($item.find('.vu').val()||'0')
    const t = (q*v).toFixed(2)
    $item.find('.vt').val(t)
  }

  $(document).on('input','.product-item .qtd, .product-item .vu',function(){
    const $item = $(this).closest('.product-item')
    recalc($item)
  })

  $('.product-item').each(function(){ recalc($(this)) })
})
